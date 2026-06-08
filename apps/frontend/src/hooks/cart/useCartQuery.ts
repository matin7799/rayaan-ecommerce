// apps/frontend/src/hooks/cart/useCartQuery.ts
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import type { UpdateCartItemPayload } from '@/services/cart.service';
import { useCartStore } from '@/lib/store/cart-store';

export const useCartQuery = () => {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartService.getCart();
      useCartStore.getState().setCart(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Synchronize TanStack query cache data to Zustand store automatically on resolution
  useEffect(() => {
    if (cartQuery.data) {
      useCartStore.getState().setCart(cartQuery.data);
    }
  }, [cartQuery.data]);

  const addMutation = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (data) useCartStore.getState().setCart(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateCartItem(variantId, payload),
    onMutate: async ({ variantId, payload }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot the previous cart state
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update the Zustand store
      useCartStore.getState().optimisticUpdateItemQuantity(variantId, payload.quantity);

      // Return context with snapshotted cart for rollback on error
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        useCartStore.getState().setCart(context.previousCart as any);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (data) useCartStore.getState().setCart(data);
    },
  });

  const removeMutation = useMutation({
    mutationFn: cartService.removeFromCart,
    onMutate: async (variantId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      
      // Optimistically update Zustand
      useCartStore.getState().optimisticRemoveItem(variantId);
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        useCartStore.getState().setCart(context.previousCart as any);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (data) useCartStore.getState().setCart(data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      useCartStore.getState().clearCart();
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addToCart: addMutation.mutate,
    isAdding: addMutation.isPending,
    updateCartItem: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    removeFromCart: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    clearCart: clearMutation.mutate,
    isClearing: clearMutation.isPending,
  };
};
