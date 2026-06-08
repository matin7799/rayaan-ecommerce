import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  slug: string;
  title: string;
  brand: string;
  thumbnail: string;
  thumbnailAlt?: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewsCount?: number;
  inStock: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => boolean;
  isInWishlist: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((existing) => existing.id === item.id)) {
            return state;
          }
          return { items: [item, ...state.items] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      toggleItem: (item) => {
        const exists = get().items.some((entry) => entry.id === item.id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((entry) => entry.id !== item.id),
          }));
          return false;
        }

        set((state) => ({ items: [item, ...state.items] }));
        return true;
      },
      isInWishlist: (id) => get().items.some((item) => item.id === id),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
