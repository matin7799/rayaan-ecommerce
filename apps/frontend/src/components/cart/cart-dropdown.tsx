'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useCartQuery } from '@/hooks/cart/useCartQuery';
import { useCartStore } from '@/lib/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDropdown() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const { cart: queryCart, isLoading, removeFromCart, isRemoving } = useCartQuery();
  const cart = useCartStore((state) => state.cart) || queryCart;

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!accessToken) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const itemCount = cart?.totalItems ?? 0;
  const items = cart?.items ?? [];
  const total = cart?.totalPrice ?? 0;

  return (
    <HoverCard>
      <HoverCardTrigger
        className="relative flex items-center justify-center cursor-pointer h-11 w-11 rounded-full bg-white/40 dark:bg-zinc-900/40 hover:bg-white/60 dark:hover:bg-zinc-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,128,128,0.15)] hover:scale-105 group z-50 focus:outline-none"
      >
        <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-200 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" />
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-[9px] font-black h-5 w-5 p-0 flex items-center justify-center shadow-lg shadow-rose-500/20 border-2 border-white dark:border-zinc-955 rounded-full">
                {itemCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        sideOffset={14}
        className="w-96 p-0 overflow-hidden bg-white/60 dark:bg-zinc-950/70 backdrop-blur-2xl saturate-150 border border-white/40 dark:border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-3 duration-300 relative"
      >
        {/* Dynamic cybermatic glowing blobs */}
        <div className="absolute top-[-15%] right-[-15%] w-44 h-44 bg-[#008080]/15 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-15%] w-44 h-44 bg-[#20B2AA]/15 rounded-full blur-[50px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full" dir="rtl">
          {/* Dropdown Header */}
          <div className="px-5 py-4.5 border-b border-white/30 dark:border-white/5 flex justify-between items-center bg-white/20 dark:bg-black/25">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#008080] dark:text-[#20B2AA]" />
              <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-100">سبد خرید شما</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-[#008080]/10 dark:bg-[#008080]/20 text-[#008080] dark:text-[#20B2AA] border border-[#008080]/15 px-2.5 py-0.5 rounded-lg font-black text-[10px]"
            >
              {itemCount} کالا
            </Badge>
          </div>

          {/* Items Content List */}
          <div className="max-h-[340px] overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4.5 items-center p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/5"
                >
                  <Skeleton className="h-14 w-14 rounded-lg shrink-0 bg-zinc-200/50 dark:bg-zinc-800/50" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full bg-zinc-200/50 dark:bg-zinc-800/50" />
                    <Skeleton className="h-2.5 w-1/2 bg-zinc-200/50 dark:bg-zinc-800/50" />
                  </div>
                </div>
              ))
            ) : items.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: -15 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex gap-3 items-center p-3 rounded-xl bg-white/30 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-colors duration-250 group border border-white/40 dark:border-white/5 hover:border-white/70 dark:hover:border-[#008080]/20 shadow-sm relative overflow-hidden"
                    >
                      {/* Glass product card preview */}
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 shadow-inner">
                        <Image
                          src={item.image || 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png'}
                          alt={item.productTitle}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Info & pricing tags */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-14 pr-1">
                        <h4
                          className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-relaxed"
                          title={item.productTitle}
                        >
                          {item.productTitle}
                        </h4>
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col items-start gap-0.5">
                            {Number(item.originalPrice) > Number(item.price) && (
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 line-through">
                                {(Number(item.originalPrice) || 0).toLocaleString('fa-IR')}
                              </span>
                            )}
                            <p className="text-xs text-[#008080] dark:text-[#20B2AA] font-black tracking-tight">
                              {(Number(item.price) || 0).toLocaleString('fa-IR')}{' '}
                              <span className="text-[9px] font-normal text-zinc-400 dark:text-zinc-500 mr-0.5">تومان</span>
                            </p>
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold bg-white/40 dark:bg-white/5 px-2 py-0.5 rounded-md border border-white/30 dark:border-white/5">
                            {item.quantity.toLocaleString('fa-IR')} عدد
                          </span>
                        </div>
                      </div>

                      {/* Eject / Delete item */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.variantId);
                        }}
                        disabled={isRemoving}
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-lg transition-all shrink-0 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200/50 dark:border-white/5">
                  <ShoppingCart className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                </div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">سبد خرید شما در حال حاضر خالی است</p>
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          {items.length > 0 && (
            <div className="p-4 bg-white/20 dark:bg-black/25 border-t border-white/30 dark:border-white/5 mt-auto">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400">جمع مبلغ نهایی:</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {(Number(total) || 0).toLocaleString('fa-IR')}{' '}
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mr-0.5">تومان</span>
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckoutClick}
                  className="w-full bg-gradient-to-r from-[#008080] to-[#20B2AA] hover:from-[#006666] hover:to-[#008080] text-white shadow-lg shadow-[#008080]/15 hover:shadow-[#008080]/25 rounded-xl h-10 text-xs font-extrabold transition-all duration-350 hover:scale-[1.01] border-none group"
                >
                  تکمیل و ثبت سفارش
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform duration-300 group-hover:-translate-x-1" />
                </Button>
                <Link href="/cart" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-9.5 text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300 hover:text-[#008080] dark:hover:text-[#20B2AA] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors shadow-sm"
                  >
                    مشاهده جزئیات سبد خرید
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
