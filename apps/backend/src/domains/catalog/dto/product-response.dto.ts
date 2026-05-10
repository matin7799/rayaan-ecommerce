import { ApiProperty } from '@nestjs/swagger';
import type { PriceBreakdown } from '../interfaces/pricing.interface';

class ProductBrandDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  logo?: string;
}

class ProductCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

class ProductTagDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  color?: string;
}

class ProductAttributeDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  value!: string;
}

class ProductOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  optionName!: string;

  @ApiProperty()
  priceModifier!: number;
}

class ProductVariantOptionDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  value!: string;
}

class ProductVariantInventoryDto {
  @ApiProperty()
  stock!: number;
}

class ProductVariantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ required: false, nullable: true })
  comparePrice?: number | null;

  @ApiProperty({ type: [ProductVariantOptionDto], required: false })
  options?: ProductVariantOptionDto[];

  @ApiProperty({ required: false, type: ProductVariantInventoryDto })
  inventory?: ProductVariantInventoryDto;
}

/**
 * Media item مخصوص محصول
 *
 * این DTO به جای thumbnail/images قدیمی استفاده می‌شود.
 * چون media دیگر داخل Product entity نیست و از Media module می‌آید.
 */
export class ProductMediaItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ required: false, nullable: true })
  thumbnailUrl?: string | null;

  @ApiProperty({ required: false, nullable: true })
  alt?: string | null;

  @ApiProperty({ required: false, nullable: true })
  caption?: string | null;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  type!: string;
}

/**
 * ساختار media کامل برای صفحه جزئیات محصول
 */
export class ProductMediaDto {
  @ApiProperty({
    required: false,
    nullable: true,
    type: ProductMediaItemDto,
  })
  thumbnail!: ProductMediaItemDto | null;

  @ApiProperty({
    type: [ProductMediaItemDto],
  })
  gallery!: ProductMediaItemDto[];
}

/**
 * Response مخصوص لیست محصولات
 *
 * GET /products
 *
 * این response سبک است و فقط thumbnail دارد.
 */
export class ProductListResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  shortDescription?: string;

  @ApiProperty()
  stockQuantity!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty({ required: false, type: ProductBrandDto })
  brand?: ProductBrandDto;

  @ApiProperty({ type: [ProductCategoryDto], required: false })
  categories?: ProductCategoryDto[];

  @ApiProperty({ type: [ProductTagDto], required: false })
  tags?: ProductTagDto[];

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  reviewsCount?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    type: ProductMediaItemDto,
  })
  thumbnail!: ProductMediaItemDto | null;

  @ApiProperty()
  pricing!: PriceBreakdown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

/**
 * Response صفحه‌بندی‌شده برای لیست محصولات
 *
 * GET /catalog/products
 *
 * این DTO شامل لیست محصولات + اطلاعات pagination است.
 */
export class CatalogPaginationMetaDto {
  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page!: number;

  @ApiProperty({
    example: 20,
    description: 'Number of products per page',
  })
  limit!: number;

  @ApiProperty({
    example: 100,
    description: 'Total number of products matching the query',
  })
  total!: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  totalPages!: number;
}

/**
 * Response صفحه‌بندی‌شده برای لیست محصولات
 *
 * GET /catalog/products
 *
 * ساختار خروجی:
 * {
 *   data: ProductListResponseDto[],
 *   meta: {
 *     page,
 *     limit,
 *     total,
 *     totalPages
 *   }
 * }
 */
export class CatalogListResponseDto {
  @ApiProperty({
    type: [ProductListResponseDto],
    description: 'List of catalog products',
  })
  data!: ProductListResponseDto[];

  @ApiProperty({
    type: CatalogPaginationMetaDto,
    description: 'Pagination metadata',
  })
  meta!: CatalogPaginationMetaDto;
}

/**
 * Response مخصوص جزئیات محصول
 *
 * GET /products/:slug
 *
 * این response کامل‌تر است و brand/categories/tags/media کامل دارد.
 */
export class ProductDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  shortDescription?: string;

  @ApiProperty()
  stockQuantity!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty({ required: false, type: ProductBrandDto })
  brand?: ProductBrandDto;

  @ApiProperty({ type: [ProductCategoryDto], required: false })
  categories?: ProductCategoryDto[];

  @ApiProperty({ type: [ProductTagDto], required: false })
  tags?: ProductTagDto[];

  @ApiProperty()
  pricing!: PriceBreakdown;

  @ApiProperty({ type: ProductMediaDto })
  media!: ProductMediaDto;

  @ApiProperty({ type: [ProductAttributeDto], required: false })
  attributes?: ProductAttributeDto[];

  @ApiProperty({ type: [ProductOptionDto], required: false })
  options?: ProductOptionDto[];

  @ApiProperty({ type: [ProductVariantDto], required: false })
  variants?: ProductVariantDto[];

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  reviewsCount?: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
