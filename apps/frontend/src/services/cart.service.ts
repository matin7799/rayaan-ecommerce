import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// ========== Types ==========
export interface CartItemOption {
  name: string;
  value: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantSku: string;
  price: number;
  quantity: number;
  subtotal: number;
  options: CartItemOption[];
  image?: string;
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

type CartEnvelope = ApiResponse<Cart> | { data: ApiResponse<Cart> } | Cart;
type RawRecord = Record<string, unknown>;

const toSafeNumber = (value: unknown): number => {
  const parsed = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === 'object' ? (value as RawRecord) : {};

const read = <T = unknown>(obj: RawRecord, ...keys: string[]): T | undefined => {
  for (const key of keys) {
    if (key in obj) return obj[key] as T;
  }
  return undefined;
};

const normalizeCart = (cart: Cart | null | undefined): Cart => {
  const source = asRecord(cart);
  const rawItems = (read<unknown[]>(source, 'items') ?? []) as unknown[];
  const normalizedItems: CartItem[] = rawItems.map((rawItem) => {
    const item = asRecord(rawItem);
    const quantity = toSafeNumber(read(item, 'quantity'));
    const price = toSafeNumber(read(item, 'price', 'unit_price', 'unitPrice'));
    const subtotal = toSafeNumber(read(item, 'subtotal', 'sub_total')) || price * quantity;

    return {
      variantId: String(read(item, 'variantId', 'variant_id') ?? ''),
      productId: String(read(item, 'productId', 'product_id') ?? ''),
      productTitle: String(read(item, 'productTitle', 'product_title', 'title') ?? ''),
      variantSku: String(read(item, 'variantSku', 'variant_sku', 'sku') ?? ''),
      price,
      quantity,
      subtotal,
      options: (read(item, 'options') as CartItemOption[] | undefined) ?? [],
      image: (read(item, 'image', 'image_url', 'thumbnail') as string | undefined) ?? undefined,
      maxStock: toSafeNumber(read(item, 'maxStock', 'max_stock', 'stock')),
    };
  });

  return {
    items: normalizedItems,
    totalItems:
      toSafeNumber(read(source, 'totalItems', 'total_items')) ||
      normalizedItems.reduce((sum, item) => sum + toSafeNumber(item.quantity), 0),
    totalPrice:
      toSafeNumber(read(source, 'totalPrice', 'total_price')) ||
      normalizedItems.reduce((sum, item) => sum + toSafeNumber(item.subtotal), 0),
  };
};

const extractCart = (payload: CartEnvelope): Cart => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return normalizeCart((payload as ApiResponse<Cart>).data);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (nested && typeof nested === 'object' && 'success' in nested && 'data' in nested) {
      return normalizeCart((nested as ApiResponse<Cart>).data);
    }
    return normalizeCart(nested as Cart);
  }

  return normalizeCart(payload as Cart);
};

// ========== Cart Service ==========
export const cartService = {
  /**
   * Get current cart
   */
  getCart: async (): Promise<Cart> => {
    const { data } = await apiClient.get<CartEnvelope>(
      API_ENDPOINTS.CART.GET
    );
    return extractCart(data);
  },

  /**
   * Add item to cart
   */
  addToCart: async (payload: AddToCartPayload): Promise<Cart> => {
    const { data } = await apiClient.post<CartEnvelope>(
      API_ENDPOINTS.CART.ADD_ITEM,
      payload
    );
    return extractCart(data);
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    variantId: string,
    payload: UpdateCartItemPayload
  ): Promise<Cart> => {
    const { data } = await apiClient.patch<CartEnvelope>(
      API_ENDPOINTS.CART.UPDATE_ITEM(variantId),
      payload
    );
    return extractCart(data);
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (variantId: string): Promise<Cart> => {
    const { data } = await apiClient.delete<CartEnvelope>(
      API_ENDPOINTS.CART.REMOVE_ITEM(variantId)
    );
    return extractCart(data);
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CART.CLEAR);
  },
};
