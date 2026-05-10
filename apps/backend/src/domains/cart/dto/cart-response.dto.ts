export class CartItemOptionResponseDto {
  name!: string;
  value!: string;
}

export class CartItemResponseDto {
  variantId!: string;
  productId!: string;
  productTitle!: string;
  variantSku!: string;
  price!: number;
  originalPrice?: number;
  quantity!: number;
  subtotal!: number;
  options!: CartItemOptionResponseDto[];
  image?: string;
  maxStock!: number;
}

export class CartResponseDto {
  items!: CartItemResponseDto[];
  totalPrice!: number;
}
