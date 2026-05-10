// apps/backend/src/domains/cart/interfaces/cart-item.interface.ts

export interface ICartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantSku: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  subtotal: number;
  options: Array<{
    name: string;
    value: string;
  }>;
  image?: string;
  maxStock: number;
}

export interface ICart {
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
}
