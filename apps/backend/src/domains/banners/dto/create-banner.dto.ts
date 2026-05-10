// apps/backend/src/domains/banners/dto/create-banner.dto.ts

import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { BannerPosition } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsUrl()
  imageUrl!: string;

  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;

  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @IsEnum(BannerPosition)
  position!: BannerPosition;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
