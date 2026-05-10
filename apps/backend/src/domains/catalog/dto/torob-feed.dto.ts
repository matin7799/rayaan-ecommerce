import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export type TorobAvailability = 'instock' | 'outofstock';

export class TorobProductsRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  page_urls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  page_uniques?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  page_size?: number;

  @IsOptional()
  @IsIn(['date_added', 'date_updated'])
  sort?: 'date_added' | 'date_updated';
}

export interface TorobProductDto {
  /**
   * Unique product identifier in your system.
   * Recommended: product.id
   */
  page_unique: string;

  /**
   * Absolute product page URL on frontend website.
   */
  page_url: string;

  /**
   * Product title.
   */
  title: string;

  /**
   * Final price for Torob.
   * Must be integer and never null.
   */
  current_price: number;

  /**
   * Previous price before discount.
   * Optional.
   */
  old_price?: number;

  /**
   * Product availability.
   */
  availability: TorobAvailability;

  /**
   * Main image must be first.
   */
  image_links: string[];

  /**
   * ISO date string.
   */
  date_added: string;

  /**
   * ISO date string.
   */
  date_updated?: string;

  /**
   * Optional fields.
   */
  product_group_id?: string;
  subtitle?: string;
  category_name?: string;
  short_desc?: string;
  spec?: Record<string, string | number | boolean>;
  guarantee?: string;
}

export interface TorobProductsResponseDto {
  api_version: 'torob_api_v3';

  current_page: number;

  /**
   * Total number of products.
   * Torob API v3 expects `total`, not `total_count`.
   */
  total: number;

  max_pages: number;

  products: TorobProductDto[];
}
