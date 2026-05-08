'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import { cartService } from '@/services/cart.service';

export default function CartPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  });

  // Update cart item mutation
  const updateMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      cartService.updateCartItem(variantId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('سبد خرید به‌روزرسانی شد');
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی سبد خرید');
    },
  });

  // Remove cart item mutation
  const removeMutation = useMutation({
    mutationFn: (variantId: string) => cartService.removeFromCart(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('محصول از سبد خرید حذف شد');
    },
    onError: () => {
      toast.error('خطا در حذف محصول');
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('سبد خرید خالی شد');
    },
    onError: () => {
      toast.error('خطا در خالی کردن سبد خرید');
    },
  });

  const handleUpdateQuantity = (variantId: string, quantity: number) => {
    updateMutation.mutate({ variantId, quantity });
  };

  const handleRemoveItem = (variantId: string) => {
    removeMutation.mutate(variantId);
  };

  const handleClearCart = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟')) {
      clearMutation.mutate();
    }
  };

  const handleCheckout = () => {
    if (!accessToken) {
      toast.info('برای ثبت سفارش ابتدا وارد شوید');
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">سبد خرید</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cart?.totalItems || 0} کالا در سبد خرید شما
            </p>
          </div>
        </div>

        {hasItems && (
          <button
            onClick={handleClearCart}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
            disabled={clearMutation.isPending}
          >
            خالی کردن سبد
          </button>
        )}
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.variantId}
                item={{
                  id: item.variantId,
                  title: item.productTitle,
                  price: item.price,
                  image: item.image || '/placeholder.png',
                  quantity: item.quantity,
                  maxQuantity: item.maxStock,
                }}
                onUpdateQuantity={(quantity) => handleUpdateQuantity(item.variantId, quantity)}
                onRemove={() => handleRemoveItem(item.variantId)}
                isUpdating={updateMutation.isPending}
                isRemoving={removeMutation.isPending}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4">
            <CartSummary subtotal={cart.totalPrice} shippingCost={0} onCheckout={handleCheckout} />
          </div>
        </div>
      ) : (
        // Empty Cart
        <div className="text-center py-24 bg-card rounded-2xl border border-border/50">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-bold mb-2">سبد خرید شما خالی است</h2>
          <p className="text-muted-foreground mb-6">
            می‌توانید به صفحه اصلی برگردید و محصولات ما را مشاهده کنید
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            مشاهده محصولات
          </Link>
        </div>
      )}
    </div>
  );
}
