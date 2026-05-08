// apps/frontend/src/hooks/cart/useCartQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import type { AddToCartPayload, UpdateCartItemPayload } from '@/services/cart.service';

export const useCartQuery = () => {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    staleTime: 1000 * 60 * 5, // 5 دقیقه
  });

  const addMutation = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateCartItem(variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: cartService.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addToCart: addMutation.mutate,
    updateCartItem: updateMutation.mutate,
    removeFromCart: removeMutation.mutate,
    clearCart: clearMutation.mutate,
  };
};
