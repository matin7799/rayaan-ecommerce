import { create } from 'zustand';
import { Cart } from '@/services/cart.service';

interface CartState {
  cart: Cart | null;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  
  // Optimistic UI updates
  optimisticUpdateItemQuantity: (variantId: string, quantity: number) => void;
  optimisticRemoveItem: (variantId: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
  
  optimisticUpdateItemQuantity: (variantId, quantity) =>
    set((state) => {
      if (!state.cart) return {};
      const updatedItems = state.cart.items.map((item) => {
        if (item.variantId === variantId) {
          const newQty = Math.max(1, Math.min(item.maxStock, quantity));
          return {
            ...item,
            quantity: newQty,
            subtotal: item.price * newQty,
          };
        }
        return item;
      });

      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        cart: {
          items: updatedItems,
          totalItems,
          totalPrice,
        },
      };
    }),

  optimisticRemoveItem: (variantId) =>
    set((state) => {
      if (!state.cart) return {};
      const updatedItems = state.cart.items.filter((item) => item.variantId !== variantId);

      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        cart: {
          items: updatedItems,
          totalItems,
          totalPrice,
        },
      };
    }),
}));
