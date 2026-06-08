// apps/frontend/src/app/(shop)/cart/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCartQuery } from '@/hooks/cart/useCartQuery';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { ShoppingBag, Loader2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const router = useRouter();
  const { accessToken, sessionChecked } = useAuthStore();

  const {
    cart,
    isLoading,
    updateCartItem,
    isUpdating,
    removeFromCart,
    isRemoving,
    clearCart,
    isClearing,
  } = useCartQuery();

  const handleUpdateQuantity = (variantId: string, quantity: number) => {
    updateCartItem({ variantId, payload: { quantity } });
  };

  const handleRemoveItem = (variantId: string) => {
    removeFromCart(variantId);
  };

  const handleClearCart = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (!sessionChecked) return;

    if (!accessToken) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (!sessionChecked || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl relative" dir="rtl">
        <div className="flex flex-col items-center justify-center py-36">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#008080]" />
            <div className="absolute w-16 h-16 bg-[#008080]/10 rounded-full blur-[20px]" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-black animate-pulse mt-5">در حال بازیابی سبد خرید شما...</p>
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl relative" dir="rtl">
      {/* Dynamic ambient cybernetic blobs */}
      <div className="absolute top-[5%] right-[10%] w-80 h-80 bg-[#008080]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[5%] w-80 h-80 bg-[#20B2AA]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header section in liquid glass panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-5 border-b border-zinc-200/50 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#008080] to-[#20B2AA] p-3 rounded-2xl text-white shadow-lg shadow-[#008080]/20 hover:scale-[1.03] transition-transform duration-350">
            <ShoppingBag className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-800 dark:text-zinc-100">سبد خرید شما</h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-bold">
              {cart?.totalItems || 0} کالا در سبد خرید شما در حال حاضر رزرو موقت شده است
            </p>
          </div>
        </div>

        {hasItems && (
          <button
            onClick={handleClearCart}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4.5 py-2 border border-rose-500/20 text-rose-500 hover:text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-black rounded-xl transition-all"
            disabled={isClearing}
          >
            {isClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>خالی کردن سبد</span>
          </button>
        )}
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={{
                    id: item.variantId,
                    title: item.productTitle,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    image: item.image || '',
                    quantity: item.quantity,
                    maxQuantity: item.maxStock,
                  }}
                  onUpdateQuantity={(quantity) => handleUpdateQuantity(item.variantId, quantity)}
                  onRemove={() => handleRemoveItem(item.variantId)}
                  isUpdating={isUpdating}
                  isRemoving={isRemoving}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 sticky top-24">
            <CartSummary subtotal={cart.totalPrice} shippingCost={0} onCheckout={handleCheckout} />
          </div>
        </div>
      ) : (
        /* Empty Cart View in Liquid Glass */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden text-center py-24 px-6 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/10 rounded-3xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
        >
          <div className="absolute top-[-20%] left-[-20%] w-72 h-72 bg-[#008080]/5 rounded-full blur-[70px]" />
          <ShoppingBag className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-5 animate-bounce" />
          <h2 className="text-lg sm:text-xl font-black text-zinc-800 dark:text-zinc-200 mb-2">سبد خرید شما در حال حاضر خالی است</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-sm mx-auto mb-8 font-extrabold leading-relaxed">
            تسهیلات اعتباری، خرید اقساطی BNPL دیجی‌پی و تنوع محصولات در انتظار شماست!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#008080] to-[#20B2AA] hover:from-[#006666] hover:to-[#008080] text-white font-extrabold rounded-2xl transition-all shadow-md shadow-[#008080]/15 hover:scale-[1.025]"
          >
            مشاهده و خرید محصولات
          </Link>
        </motion.div>
      )}
    </div>
  );
}
