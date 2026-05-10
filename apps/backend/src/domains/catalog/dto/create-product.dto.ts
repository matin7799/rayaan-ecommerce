// src/domains/catalog/dto/create-product.dto.ts

import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductAttributeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class CreateProductOptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  option_name!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_modifier!: number;
}

export class CreateProductDto {
  /**
   * Product.name
   *
   * در Entity با column name = title ذخیره می‌شود.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  /**
   * Product.slug
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  @Matches(/^\d{4,6}$/, { message: 'sku must be a 4 to 6 digit number' })
  sku!: string;

  /**
   * Product.description
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Product.shortDescription
   */
  @IsString()
  @IsOptional()
  short_description?: string;

  /**
   * Product.basePrice
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  base_price!: number;

  /**
   * Product.salePrice
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  sale_price?: number;

  /**
   * Product.partnerDiscountPercent
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  partner_discount_percent?: number;

  /**
   * Product.isOnSale
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_on_sale?: boolean;

  /**
   * Product.saleStartDate
   */
  @IsDateString()
  @IsOptional()
  sale_start_date?: string;

  /**
   * Product.saleEndDate
   */
  @IsDateString()
  @IsOptional()
  sale_end_date?: string;

  /**
   * Product.stockQuantity
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  stock_quantity?: number;

  /**
   * Product.trackInventory
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  track_inventory?: boolean;

  /**
   * Product.lowStockThreshold
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  low_stock_threshold?: number;

  /**
   * Product.featuredImage
   *
   * اگر هنوز از Media module برای thumbnail استفاده می‌کنی،
   * این فیلد می‌تواند optional بماند.
   */
  @IsString()
  @IsOptional()
  @IsUrl()
  featured_image?: string;

  /**
   * برای ثبت thumbnail در Media module.
   *
   * این فیلد داخل Product entity نیست،
   * اما برای create flow کاربرد دارد.
   */
  @IsString()
  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  /**
   * برای ثبت gallery در Media module.
   *
   * این فیلد داخل Product entity نیست.
   */
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  media_ids?: string[];

  /**
   * Product.brand
   */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  brand_slug?: string;

  /**
   * Product.categories
   */
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  category_slugs!: string[];

  /**
   * Product.tags
   */
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tag_slugs?: string[];
  /**
   * Product.metaTitle
   */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  meta_title?: string;

  /**
   * Product.metaDescription
   */
  @IsString()
  @IsOptional()
  meta_description?: string;

  /**
   * Product.metaKeywords
   */
  @IsString()
  @IsOptional()
  meta_keywords?: string;

  /**
   * Product.isActive
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_active?: boolean;

  /**
   * Product.isFeatured
   */
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_featured?: boolean;

  /**
   * Product.attributes
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeDto)
  attributes?: CreateProductAttributeDto[];

  /**
   * Product.options
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];
}
