import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';

import { User } from '../../users/entities/user.entity';
import { MediaType } from '../../media/entities/media.entity';
import { MediaService } from '../../media/media.service';

import {
  CatalogListResponseDto,
  ProductDetailResponseDto,
} from '../dto/product-response.dto';
import {
  QueryCatalogDto,
  SortField,
  SortOrder,
} from '../dto/query-catalog.dto';
import { Product } from '../entities/product.entity';
import {
  PriceCalculatorService,
  PricingChannel,
} from './price-calculator.service';
import {
  TorobProductsRequestDto,
  TorobProductsResponseDto,
} from '../dto/torob-feed.dto';
import { mapProductToTorobDto } from '../mappers/torob-product.mapper';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductsRepository } from '../catalog.repository';
import { ConfigService } from '@nestjs/config';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductAttribute } from '../entities/product-attribute.entity';
import { ProductOption } from '../entities/product-option.entity';
import { PriceBreakdown } from '../interfaces/pricing.interface';
import { isTorobAttributed } from '../../../common/utils/torob-attribution.util';
import { Role } from '../../auth/enums/role.enum';
import { CacheService } from '../../../shared/redis/cache.service';
import { CatalogInvalidationService } from './catalog-invalidation.service';
import { DynamicTtlHelper } from './dynamic-ttl.helper';
import {
  toProductListResponse,
  toProductDetailResponse,
  pickThumbnail,
} from './catalog-mapper';
import {
  applyFilters,
  applySorting,
  addCatalogHiddenSelects,
  addPricingSelects,
  generateUniqueSlug,
} from './catalog-query.helper';

export interface CatalogMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly priceCalculator: PriceCalculatorService,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly catalogInvalidationService: CatalogInvalidationService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
  ): Promise<ProductDetailResponseDto> {
    const existingSku = await this.productsRepository.findBySku(dto.sku);
    if (existingSku) {
      throw new BadRequestException('Product with this sku already exists');
    }

    const normalizedSlug = dto.slug.trim().toLowerCase();
    const existingProduct =
      await this.productsRepository.findBySlug(normalizedSlug);

    let finalSlug = normalizedSlug;

    if (existingProduct && existingProduct.sku !== dto.sku.trim()) {
      finalSlug = await generateUniqueSlug(
        this.productsRepository,
        normalizedSlug,
        dto.sku,
      );
    } else if (existingProduct) {
      throw new BadRequestException('Product with this slug already exists');
    }

    dto.slug = finalSlug;

    if (
      dto.sale_price !== undefined &&
      dto.sale_price !== null &&
      dto.sale_price > dto.base_price
    ) {
      throw new BadRequestException(
        'Sale price cannot be greater than base price',
      );
    }

    const normalizedBrandSlug = dto.brand_slug?.trim().toLowerCase();

    const normalizedCategorySlugs = [
      ...new Set(
        (dto.category_slugs ?? [])
          .map((slug) => slug.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    const normalizedTagSlugs = [
      ...new Set(
        (dto.tag_slugs ?? [])
          .map((slug) => slug.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    if (!normalizedCategorySlugs.length) {
      throw new BadRequestException('At least one category_slug is required');
    }

    const brand = normalizedBrandSlug
      ? await this.productsRepository.findOrCreateBrandBySlug(
          normalizedBrandSlug,
        )
      : null;

    const categories =
      await this.productsRepository.findOrCreateCategoriesBySlugs(
        normalizedCategorySlugs,
      );

    const tags = normalizedTagSlugs.length
      ? await this.productsRepository.findOrCreateTagsBySlugs(
          normalizedTagSlugs,
        )
      : [];

    const sharedMedia = dto.media_ids?.length
      ? await this.mediaService.findAllByIds(dto.media_ids)
      : [];
    if ((dto.media_ids?.length ?? 0) !== sharedMedia.length) {
      throw new BadRequestException('One or more media_ids are invalid');
    }

    const product = await this.productsRepository.createProduct({
      dto,
      brand,
      categories,
      tags,
      media: sharedMedia,
    });

    const thumbnailUrl = dto.thumbnail_url?.trim();

    const galleryUrls = (dto.images ?? [])
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .filter((url) => url !== thumbnailUrl);

    const uniqueGalleryUrls = [...new Set(galleryUrls)];

    const mediaUrls = thumbnailUrl
      ? [thumbnailUrl, ...uniqueGalleryUrls]
      : uniqueGalleryUrls;

    for (let index = 0; index < mediaUrls.length; index += 1) {
      const media = await this.mediaService.registerByUrl({
        url: mediaUrls[index],
        type: MediaType.IMAGE,
        alt: dto.name,
        caption: dto.name,
        order: index,
      });
      await this.mediaService.attachMediaToProduct(
        product.id,
        media.id,
        index,
        dto.name,
        dto.name,
      );
    }

    const loadedProduct = await this.productsRepository.findDetailById(
      product.id,
    );

    if (!loadedProduct) {
      throw new InternalServerErrorException(
        'Failed to retrieve product after creation',
      );
    }

    const media = await this.mediaService.getProductMedia(loadedProduct.id);
    const pricing = this.priceCalculator.calculatePrice(loadedProduct, {
      user: undefined,
      channel: PricingChannel.PUBLIC,
    });

    await this.catalogInvalidationService
      .invalidateProductCache(loadedProduct.slug)
      .catch(() => {});

    return toProductDetailResponse(loadedProduct, media, pricing);
  }

  async findAll(
    query: QueryCatalogDto,
    user?: User,
    req?: Request,
  ): Promise<CatalogListResponseDto> {
    const isPublicRequest =
      !user &&
      !req?.headers?.cookie?.includes('auth') &&
      !req?.headers?.authorization;
    const isSimpleList =
      !query.search &&
      !query.minPrice &&
      !query.maxPrice &&
      !query.brandSlugs?.length &&
      !query.tagSlugs?.length;

    const pricingChannel = this.resolvePricingChannel(req, user);

    if (isPublicRequest && isSimpleList) {
      const cacheKey = CacheService.catalogListKey(
        query as unknown as Record<string, unknown>,
        pricingChannel,
      );
      const cached =
        await this.cacheService.get<CatalogListResponseDto>(cacheKey);
      if (cached) return cached;
    }

    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;

      const queryBuilder = this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.categories', 'category')
        .leftJoinAndSelect('product.tags', 'tag')
        .leftJoinAndSelect('product.variants', 'variant')
        .leftJoinAndSelect('variant.options', 'variantOption')
        .leftJoinAndSelect('variant.inventory', 'inventory');

      addCatalogHiddenSelects(queryBuilder);
      applyFilters(queryBuilder, query);
      applySorting(
        queryBuilder,
        query.sortBy ?? SortField.CREATED_AT,
        query.sortOrder ?? SortOrder.DESC,
      );

      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .distinct(true);

      const [products, total] = await queryBuilder.getManyAndCount();

      const productIds = products.map((product) => product.id);

      const mediaMap =
        productIds.length > 0
          ? await this.mediaService.getProductMediaMap(productIds)
          : {};

      const pricingChannel = this.resolvePricingChannel(req, user);

      const data = products.map((product) => {
        const pricing = this.priceCalculator.calculatePrice(product, {
          user,
          channel: pricingChannel,
        });
        return toProductListResponse(
          product,
          mediaMap[product.id] ?? [],
          pricing,
        );
      });

      const result: CatalogListResponseDto = {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      };

      if (isPublicRequest && isSimpleList) {
        const cacheKey = CacheService.catalogListKey(
          query as unknown as Record<string, unknown>,
          pricingChannel,
        );
        await this.cacheService.set(cacheKey, result, 60);
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch catalog products',
      );
    }
  }

  async findAllForTable(
    query: QueryCatalogDto,
    user?: User,
    req?: Request,
  ): Promise<CatalogListResponseDto> {
    try {
      const queryBuilder = this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.categories', 'category')
        .leftJoinAndSelect('product.tags', 'tag')
        .leftJoinAndSelect('product.variants', 'variant')
        .leftJoinAndSelect('variant.options', 'variantOption')
        .leftJoinAndSelect('variant.inventory', 'inventory');

      addCatalogHiddenSelects(queryBuilder);
      applyFilters(queryBuilder, query);
      applySorting(
        queryBuilder,
        query.sortBy ?? SortField.CREATED_AT,
        query.sortOrder ?? SortOrder.DESC,
      );

      queryBuilder.distinct(true);

      const products = await queryBuilder.getMany();
      const total = products.length;
      const productIds = products.map((product) => product.id);

      const mediaMap =
        productIds.length > 0
          ? await this.mediaService.getProductMediaMap(productIds)
          : {};

      const pricingChannel = this.resolvePricingChannel(req, user);
      const data = products.map((product) => {
        const pricing = this.priceCalculator.calculatePrice(product, {
          user,
          channel: pricingChannel,
        });
        return toProductListResponse(
          product,
          mediaMap[product.id] ?? [],
          pricing,
        );
      });

      return {
        data,
        meta: {
          page: 1,
          limit: total || 1,
          total,
          totalPages: 1,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch catalog table products',
      );
    }
  }

  async findOneBySlug(
    slug: string,
    user?: User,
    req?: Request,
  ): Promise<ProductDetailResponseDto> {
    const isPublicRequest =
      !user &&
      !req?.headers?.cookie?.includes('auth') &&
      !req?.headers?.authorization;
    const pricingChannel = this.resolvePricingChannel(req, user);
    if (isPublicRequest) {
      const cacheKey = CacheService.catalogDetailKey(slug, pricingChannel);
      const cached =
        await this.cacheService.get<ProductDetailResponseDto>(cacheKey);
      if (cached) return cached;
    }

    try {
      const queryBuilder = this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.categories', 'categories')
        .leftJoinAndSelect('product.tags', 'tags')
        .leftJoinAndSelect('product.attributes', 'attributes')
        .leftJoinAndSelect('product.options', 'options')
        .leftJoinAndSelect('product.variants', 'variants')
        .leftJoinAndSelect('variants.options', 'variantOptions')
        .leftJoinAndSelect('variants.inventory', 'variantInventory')
        .where('product.slug = :slug', { slug })
        .addSelect([
          'product.basePrice',
          'product.salePrice',
          'product.partnerDiscountPercent',
          'product.isOnSale',
          'product.saleStartDate',
          'product.saleEndDate',
          'product.stockQuantity',
          'product.isFeatured',
          'product.shortDescription',
        ]);

      const product = await queryBuilder.getOne();

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const pricingChannel = this.resolvePricingChannel(req, user);
      const pricing = this.priceCalculator.calculatePrice(product, {
        user,
        channel: pricingChannel,
      });

      const media = await this.mediaService.getProductMedia(product.id);

      const result = toProductDetailResponse(product, media, pricing);

      if (isPublicRequest) {
        const cacheKey = CacheService.catalogDetailKey(slug, pricingChannel);
        const dynamicTtl = DynamicTtlHelper.calculate(product);
        await this.cacheService.set(cacheKey, result, dynamicTtl);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to fetch product',
      );
    }
  }

  async findByVariantId(variantId: string): Promise<Product | null> {
    const byVariant = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.options', 'variantOptions')
      .leftJoinAndSelect('variants.inventory', 'variantInventory')
      .where('variants.id = :variantId', { variantId })
      .addSelect([
        'product.basePrice',
        'product.salePrice',
        'product.partnerDiscountPercent',
        'product.isOnSale',
        'product.saleStartDate',
        'product.saleEndDate',
        'product.stockQuantity',
      ])
      .getOne();

    if (byVariant) {
      return byVariant;
    }

    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.options', 'variantOptions')
      .leftJoinAndSelect('variants.inventory', 'variantInventory')
      .where('product.id = :productId', { productId: variantId })
      .addSelect([
        'product.basePrice',
        'product.salePrice',
        'product.partnerDiscountPercent',
        'product.isOnSale',
        'product.saleStartDate',
        'product.saleEndDate',
        'product.stockQuantity',
      ])
      .getOne();
  }

  async updateProductByAdmin(
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductDetailResponseDto> {
    const product = await this.productsRepository.findDetailById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined)
      product.description = dto.description ?? null;
    if (dto.short_description !== undefined) {
      product.shortDescription = dto.short_description ?? null;
    }
    if (dto.base_price !== undefined) product.basePrice = dto.base_price;
    if (dto.sale_price !== undefined)
      product.salePrice = dto.sale_price ?? null;
    if (dto.partner_discount_percent !== undefined) {
      product.partnerDiscountPercent = dto.partner_discount_percent;
    }
    if (dto.is_on_sale !== undefined) product.isOnSale = dto.is_on_sale;
    if (dto.stock_quantity !== undefined)
      product.stockQuantity = dto.stock_quantity;
    if (dto.is_active !== undefined) product.isActive = dto.is_active;
    if (dto.is_featured !== undefined) product.isFeatured = dto.is_featured;
    if (dto.meta_title !== undefined)
      product.metaTitle = dto.meta_title ?? null;
    if (dto.meta_description !== undefined)
      product.metaDescription = dto.meta_description ?? null;
    if (dto.meta_keywords !== undefined)
      product.metaKeywords = dto.meta_keywords ?? null;

    if (dto.sku !== undefined && dto.sku !== product.sku) {
      const existingSku = await this.productsRepository.findBySku(dto.sku);
      if (existingSku && existingSku.id !== product.id) {
        throw new BadRequestException('Product with this sku already exists');
      }
      product.sku = dto.sku;
    }

    if (dto.brand_slug !== undefined) {
      const normalizedBrandSlug = dto.brand_slug?.trim().toLowerCase();
      product.brand = normalizedBrandSlug
        ? await this.productsRepository.findOrCreateBrandBySlug(
            normalizedBrandSlug,
          )
        : null;
    }

    if (dto.category_slugs?.length) {
      product.categories =
        await this.productsRepository.findOrCreateCategoriesBySlugs(
          dto.category_slugs,
        );
    }

    if (dto.tag_slugs) {
      product.tags = dto.tag_slugs.length
        ? await this.productsRepository.findOrCreateTagsBySlugs(dto.tag_slugs)
        : [];
    }

    if (dto.attributes) {
      product.attributes =
        dto.attributes.map((attribute) =>
          this.productsRepository.manager
            .getRepository(ProductAttribute)
            .create({
              key: attribute.key,
              value: attribute.value,
              product,
            }),
        ) ?? [];
    }

    if (dto.options) {
      product.options =
        dto.options.map((option) =>
          this.productsRepository.manager.getRepository(ProductOption).create({
            option_name: option.option_name,
            price_modifier: option.price_modifier,
            product,
          }),
        ) ?? [];
    }

    await this.productsRepository.save(product);

    const media = await this.mediaService.getProductMedia(product.id);
    const pricing = this.priceCalculator.calculatePrice(product, {
      user: undefined,
      channel: PricingChannel.PUBLIC,
    });

    await this.catalogInvalidationService
      .invalidateProductCache(product.slug)
      .catch(() => {});

    return toProductDetailResponse(product, media, pricing);
  }

  async getTorobFeed(
    query: TorobProductsRequestDto,
  ): Promise<TorobProductsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.page_size ?? 20;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.options', 'variantOptions')
      .leftJoinAndSelect('variants.inventory', 'variantInventory');

    addCatalogHiddenSelects(queryBuilder);
    addPricingSelects(queryBuilder);

    queryBuilder
      .andWhere('product.isActive = :isActive', { isActive: true })
      .skip((page - 1) * limit)
      .take(limit)
      .distinct(true);

    const [products, total] = await queryBuilder.getManyAndCount();

    const mediaMap =
      products.length > 0
        ? await this.mediaService.getProductMediaMap(
            products.map((product) => product.id),
          )
        : {};

    const frontendBaseUrl =
      this.configService.get<string>('FRONTEND_URL') ?? '';

    return {
      api_version: 'torob_api_v3',
      current_page: page,
      total,
      max_pages: Math.ceil(total / limit),
      products: products.map((product) =>
        mapProductToTorobDto(
          product,
          mediaMap[product.id] ?? [],
          frontendBaseUrl,
        ),
      ),
    };
  }

  public async getProductThumbnailUrl(
    productId: string,
  ): Promise<string | null> {
    const media = await this.mediaService.getProductMedia(productId);
    return pickThumbnail(media)?.url ?? null;
  }

  public getProductUnitPriceForChannel(
    product: Product,
    user?: User,
    pricingChannel: PricingChannel = PricingChannel.PUBLIC,
  ): number {
    return this.priceCalculator.calculatePrice(product, {
      user,
      channel: pricingChannel,
    }).finalPrice;
  }

  public getProductPriceBreakdownForChannel(
    product: Product,
    user?: User,
    pricingChannel: PricingChannel = PricingChannel.PUBLIC,
  ): PriceBreakdown {
    return this.priceCalculator.calculatePrice(product, {
      user,
      channel: pricingChannel,
    });
  }

  private resolvePricingChannel(req?: Request, user?: User): PricingChannel {
    if (isTorobAttributed(req)) {
      return PricingChannel.TOROB;
    }

    if (user?.role === Role.PARTNER) {
      return PricingChannel.PARTNER;
    }

    return PricingChannel.PUBLIC;
  }
}
