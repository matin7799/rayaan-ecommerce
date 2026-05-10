import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import type { Request } from 'express';

import { User } from '../../users/entities/user.entity';
import { Media, MediaType } from '../../media/entities/media.entity';
import { MediaService } from '../../media/media.service';

import {
  CatalogListResponseDto,
  ProductDetailResponseDto,
  ProductListResponseDto,
  ProductMediaItemDto,
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

export interface CatalogMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CatalogListResponse {
  data: ProductListResponseDto[];
  meta: CatalogMeta;
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly priceCalculator: PriceCalculatorService,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
  ): Promise<ProductDetailResponseDto> {
    const existingProduct = await this.productsRepository.findBySlug(dto.slug);

    if (existingProduct) {
      throw new BadRequestException('Product with this slug already exists');
    }

    const existingSku = await this.productsRepository.findBySku(dto.sku);
    if (existingSku) {
      throw new BadRequestException('Product with this sku already exists');
    }
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

    /**
     * Brand:
     * اگر slug ارسال شده باشد:
     * - اگر وجود داشت همان را برمی‌گرداند
     * - اگر وجود نداشت می‌سازد
     */
    const brand = normalizedBrandSlug
      ? await this.productsRepository.findOrCreateBrandBySlug(
          normalizedBrandSlug,
        )
      : null;

    /**
     * Categories:
     * همه category slugها را می‌گیرد.
     * موجودها را پیدا می‌کند.
     * ناموجودها را می‌سازد.
     */
    const categories =
      await this.productsRepository.findOrCreateCategoriesBySlugs(
        normalizedCategorySlugs,
      );

    /**
     * Tags:
     * اگر tag_slugs ارسال شده باشد:
     * - موجودها را پیدا می‌کند
     * - ناموجودها را می‌سازد
     */
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

    /**
     * Media URLs:
     * اگر thumbnail_url با یکی از images یکی بود، duplicate حذف می‌شود.
     */
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

    return this.toProductDetailResponse(loadedProduct, media, undefined);
  }

  async findAll(
    query: QueryCatalogDto,
    user?: User,
    req?: Request,
  ): Promise<CatalogListResponseDto> {
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

      this.addCatalogHiddenSelects(queryBuilder);
      this.applyFilters(queryBuilder, query);
      this.applySorting(
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

      const pricingChannel = isTorobAttributed(req)
        ? PricingChannel.TOROB
        : PricingChannel.PUBLIC;

      const data = products.map((product) =>
        this.toProductListResponse(
          product,
          mediaMap[product.id] ?? [],
          user,
          pricingChannel,
        ),
      );

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch catalog products',
      );
    }
  }

  async findOneBySlug(
    slug: string,
    user?: User,
    req?: Request,
  ): Promise<ProductDetailResponseDto> {
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

      const pricingChannel = isTorobAttributed(req)
        ? PricingChannel.TOROB
        : PricingChannel.PUBLIC;

      const media = await this.mediaService.getProductMedia(product.id);

      return this.toProductDetailResponse(product, media, user, pricingChannel);
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
    return this.toProductDetailResponse(product, media, undefined);
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

    this.addCatalogHiddenSelects(queryBuilder);
    this.addPricingSelects(queryBuilder);

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
        mapProductToTorobDto(product, mediaMap[product.id] ?? [], frontendBaseUrl),
      ),
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    query: QueryCatalogDto,
  ): void {
    if (query.search) {
      queryBuilder.andWhere(
        `(
          product.name ILIKE :search
          OR product.description ILIKE :search
          OR category.name ILIKE :search
          OR category.slug ILIKE :search
          OR tag.name ILIKE :search
          OR tag.slug ILIKE :search
        )`,
        { search: `%${query.search}%` },
      );
    }

    if (query.categorySlugs?.length) {
      queryBuilder.andWhere('category.slug IN (:...categorySlugs)', {
        categorySlugs: query.categorySlugs,
      });
    }

    if (query.brandSlugs?.length) {
      queryBuilder.andWhere('brand.slug IN (:...brandSlugs)', {
        brandSlugs: query.brandSlugs,
      });
    }

    if (query.tagSlugs?.length) {
      queryBuilder.andWhere('tag.slug IN (:...tagSlugs)', {
        tagSlugs: query.tagSlugs,
      });
    }

    if (query.isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured,
      });
    }

    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('product.basePrice >= :minPrice', {
        minPrice: query.minPrice,
      });
    }

    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('product.basePrice <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Product>,
    sortBy: SortField,
    sortOrder: SortOrder,
  ): void {
    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    switch (sortBy) {
      case SortField.PRICE:
        queryBuilder.orderBy('product.basePrice', direction);
        break;
      case SortField.NAME:
        queryBuilder.orderBy('product.name', direction);
        break;
      case SortField.CREATED_AT:
      default:
        queryBuilder.orderBy('product.createdAt', direction);
        break;
    }
  }

  private toProductListResponse(
    product: Product,
    media: Media[],
    user?: User,
    pricingChannel: PricingChannel = PricingChannel.PUBLIC,
  ): ProductListResponseDto {
    const thumbnail = this.pickThumbnail(media);

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      title: product.name,
      slug: product.slug,
      description: product.description ?? undefined,
      shortDescription: product.shortDescription ?? undefined,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            logo: product.brand.logoUrl ?? undefined,
          }
        : undefined,
      categories:
        product.categories?.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })) ?? [],
      tags:
        product.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: 'color' in tag ? (tag.color as string | undefined) : undefined,
        })) ?? [],
      rating: 0,
      reviewsCount: 0,
      thumbnail: thumbnail ? this.toMediaItemDto(thumbnail) : null,
      pricing: this.priceCalculator.calculatePrice(product, {
        user,
        channel: pricingChannel,
      }),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toProductDetailResponse(
    product: Product,
    media: Media[],
    user?: User,
    pricingChannel: PricingChannel = PricingChannel.PUBLIC,
  ): ProductDetailResponseDto {
    const sortedMedia = this.sortMedia(media);
    const thumbnail = this.pickThumbnail(sortedMedia);

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      title: product.name,
      slug: product.slug,
      description: product.description ?? undefined,
      shortDescription: product.shortDescription ?? undefined,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            logo: product.brand.logoUrl ?? undefined,
          }
        : undefined,
      categories:
        product.categories?.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })) ?? [],
      tags:
        product.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: 'color' in tag ? (tag.color as string | undefined) : undefined,
        })) ?? [],
      pricing: this.priceCalculator.calculatePrice(product, {
        user,
        channel: pricingChannel,
      }),
      media: {
        thumbnail: thumbnail ? this.toMediaItemDto(thumbnail) : null,
        gallery: sortedMedia.map((item) => this.toMediaItemDto(item)),
      },
      attributes:
        product.attributes?.map((attribute) => ({
          key: attribute.key,
          value: attribute.value,
        })) ?? [],
      options:
        product.options?.map((option) => ({
          id: option.id,
          optionName: option.option_name,
          priceModifier: Number(option.price_modifier ?? 0),
        })) ?? [],
      variants:
        product.variants?.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          price: Number(variant.price ?? 0),
          comparePrice:
            variant.comparePrice === null || variant.comparePrice === undefined
              ? null
              : Number(variant.comparePrice),
          options:
            variant.options?.map((option) => ({
              name: option.name,
              value: option.value,
            })) ?? [],
          inventory: variant.inventory
            ? {
                stock: variant.inventory.stock,
              }
            : undefined,
        })) ?? [],
      rating: 0,
      reviewsCount: 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private sortMedia(media: Media[]): Media[] {
    return [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  private pickThumbnail(media: Media[]): Media | null {
    if (!media.length) {
      return null;
    }

    const sorted = this.sortMedia(media);
    return sorted[0] ?? null;
  }

  public async getProductThumbnailUrl(
    productId: string,
  ): Promise<string | null> {
    const media = await this.mediaService.getProductMedia(productId);

    return this.pickThumbnail(media)?.url ?? null;
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

  private toMediaItemDto(mediaItem: Media): ProductMediaItemDto {
    return {
      id: mediaItem.id,
      url: mediaItem.url,
      thumbnailUrl: mediaItem.thumbnailUrl ?? undefined,
      type: mediaItem.type,
      alt: mediaItem.alt ?? undefined,
      caption: mediaItem.caption ?? undefined,
      order: mediaItem.order ?? undefined,
    };
  }

  private addPricingSelects(
    queryBuilder: SelectQueryBuilder<Product>,
  ): SelectQueryBuilder<Product> {
    return queryBuilder.addSelect([
      'product.basePrice',
      'product.salePrice',
      'product.partnerDiscountPercent',
      'product.isOnSale',
      'product.saleStartDate',
      'product.saleEndDate',
    ]);
  }

  private addCatalogHiddenSelects(
    queryBuilder: SelectQueryBuilder<Product>,
  ): SelectQueryBuilder<Product> {
    return queryBuilder.addSelect([
      'product.stockQuantity',
      'product.trackInventory',
      'product.lowStockThreshold',
      'product.metaTitle',
      'product.metaDescription',
      'product.metaKeywords',
      'product.isActive',
      'product.isFeatured',
      'product.shortDescription',
      'product.basePrice',
      'product.salePrice',
      'product.isOnSale',
      'product.saleStartDate',
      'product.saleEndDate',
      'product.partnerDiscountPercent',
    ]);
  }
}
