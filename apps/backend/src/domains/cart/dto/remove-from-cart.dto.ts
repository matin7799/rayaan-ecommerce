// apps/backend/src/domains/cart/dto/remove-from-cart.dto.ts

import { IsUUID } from 'class-validator';

export class RemoveFromCartDto {
  @IsUUID()
  variantId!: string;
}
