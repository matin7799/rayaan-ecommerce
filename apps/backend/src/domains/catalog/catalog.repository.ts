import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductOption } from './entities/product-option.entity';
import { Product } from './entities/product.entity';
import { Tag } from './entities/tag.entity';
import { Media } from '../media/entities/media.entity';
import { ProductMedia } from './entities/product-media.entity';

@Injectable()
export class ProductsRepository extends Repository<Product> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(Product, dataSource.createEntityManager());
  }

  private slugToTitle(slug: string): string {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.findOne({
      where: {
        slug: slug.trim().toLowerCase(),
      },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.findOne({
      where: {
        sku: sku.trim(),
      },
    });
  }

  async findBrandById(brandId: string): Promise<Brand | null> {
    return this.dataSource.getRepository(Brand).findOne({
      where: { id: brandId },
    });
  }

  async findOrCreateBrandBySlug(slug: string): Promise<Brand> {
    const normalizedSlug = slug.trim().toLowerCase();

    const brandRepository = this.dataSource.getRepository(Brand);

    let brand = await brandRepository.findOne({
      where: { slug: normalizedSlug },
    });

    if (brand) {
      return brand;
    }

    try {
      brand = brandRepository.create({
        slug: normalizedSlug,
        name: this.slugToTitle(normalizedSlug),
      });

      return await brandRepository.save(brand);
    } catch (error: any) {
      // اگر همزمان request دیگری همین brand را ساخته باشد
      if (error?.code === '23505') {
        const existingBrand = await brandRepository.findOne({
          where: { slug: normalizedSlug },
        });

        if (existingBrand) return existingBrand;
      }

      throw error;
    }
  }

  async findCategoriesByIds(categoryIds: string[]): Promise<Category[]> {
    if (!categoryIds.length) {
      return [];
    }

    return this.dataSource.getRepository(Category).find({
      where: {
        id: In(categoryIds),
      },
    });
  }

  async findOrCreateCategoriesBySlugs(slugs: string[]): Promise<Category[]> {
    const categoryRepository = this.dataSource.getRepository(Category);

    const normalizedSlugs = [
      ...new Set(
        slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean),
      ),
    ];

    const existingCategories = await categoryRepository.find({
      where: {
        slug: In(normalizedSlugs),
      },
    });

    const existingSlugSet = new Set(existingCategories.map((c) => c.slug));

    const missingSlugs = normalizedSlugs.filter(
      (slug) => !existingSlugSet.has(slug),
    );

    const createdCategories: Category[] = [];

    for (const slug of missingSlugs) {
      try {
        const category = categoryRepository.create({
          slug,
          name: this.slugToTitle(slug),
        });

        const saved = await categoryRepository.save(category);
        createdCategories.push(saved);
      } catch (error: any) {
        if (error?.code === '23505') {
          const existing = await categoryRepository.findOne({
            where: { slug },
          });
          if (existing) {
            createdCategories.push(existing);
            continue;
          }
        }

        throw error;
      }
    }

    return [...existingCategories, ...createdCategories];
  }

  async findTagsByIds(tagIds: string[]): Promise<Tag[]> {
    if (!tagIds.length) {
      return [];
    }

    return this.dataSource.getRepository(Tag).find({
      where: {
        id: In(tagIds),
      },
    });
  }

  async findOrCreateTagsBySlugs(slugs: string[]): Promise<Tag[]> {
    const tagRepository = this.dataSource.getRepository(Tag);

    const normalizedSlugs = [
      ...new Set(
        slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean),
      ),
    ];

    const existingTags = await tagRepository.find({
      where: {
        slug: In(normalizedSlugs),
      },
    });

    const existingSlugSet = new Set(existingTags.map((t) => t.slug));

    const missingSlugs = normalizedSlugs.filter(
      (slug) => !existingSlugSet.has(slug),
    );

    const createdTags: Tag[] = [];

    for (const slug of missingSlugs) {
      try {
        const tag = tagRepository.create({
          slug,
          name: this.slugToTitle(slug),
        });

        const saved = await tagRepository.save(tag);
        createdTags.push(saved);
      } catch (error: any) {
        if (error?.code === '23505') {
          const existing = await tagRepository.findOne({
            where: { slug },
          });
          if (existing) {
            createdTags.push(existing);
            continue;
          }
        }

        throw error;
      }
    }

    return [...existingTags, ...createdTags];
  }

  async createProduct(params: {
    dto: CreateProductDto;
    brand: Brand | null;
    categories: Category[];
    tags: Tag[];
    media?: Media[];
  }): Promise<Product> {
    const { dto, brand, categories, tags, media = [] } = params;

    const product = this.create({
      name: dto.name,
      slug: dto.slug.trim().toLowerCase(),
      sku: dto.sku.trim(),
      description: dto.description ?? null,
      shortDescription: dto.short_description ?? null,
      basePrice: dto.base_price,
      salePrice: dto.sale_price ?? null,
      stockQuantity: dto.stock_quantity ?? 0,
      isActive: dto.is_active ?? true,
      isFeatured: dto.is_featured ?? false,
      isOnSale: dto.is_on_sale ?? false,
      saleStartDate: dto.sale_start_date ?? null,
      saleEndDate: dto.sale_end_date ?? null,
      metaTitle: dto.meta_title ?? null,
      metaDescription: dto.meta_description ?? null,
      metaKeywords: dto.meta_keywords ?? null,

      brand: brand ?? undefined,
      categories,
      tags,

      attributes:
        dto.attributes?.map((attribute) =>
          this.dataSource.getRepository(ProductAttribute).create({
            key: attribute.key,
            value: attribute.value,
          }),
        ) ?? [],

      options:
        dto.options?.map((option) =>
          this.dataSource.getRepository(ProductOption).create({
            option_name: option.option_name,
            price_modifier: option.price_modifier,
          }),
        ) ?? [],
    });

    const savedProduct = await this.save(product);

    if (media.length > 0) {
      const productMediaRepo = this.dataSource.getRepository(ProductMedia);
      const rows = media.map((item, index) =>
        productMediaRepo.create({
          productId: savedProduct.id,
          mediaId: item.id,
          order: index,
          alt: item.alt ?? null,
          caption: item.caption ?? null,
        }),
      );
      await productMediaRepo.save(rows);
    }

    return savedProduct;
  }

  async findDetailById(productId: string): Promise<Product | null> {
    return this.findOne({
      where: { id: productId },
      relations: {
        brand: true,
        categories: true,
        tags: true,
        productMedia: {
          media: true,
        },
        attributes: true,
        options: true,
        variants: {
          options: true,
          inventory: true,
        },
      },
    });
  }
}
