// backend/src/domains/shipping/dto/create-shipping-method.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  estimated_days?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  is_pay_on_delivery?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sort_order?: number;
}
