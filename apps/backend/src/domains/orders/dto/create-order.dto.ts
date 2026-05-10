// apps/backend/src/domains/orders/dto/create-order.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  addressId!: string;

  @IsUUID()
  @IsNotEmpty()
  shippingMethodId!: string;

  @IsEnum(['online', 'cash_on_delivery'])
  paymentMethod!: 'online' | 'cash_on_delivery';

  @IsString()
  @IsOptional()
  notes?: string;
}
