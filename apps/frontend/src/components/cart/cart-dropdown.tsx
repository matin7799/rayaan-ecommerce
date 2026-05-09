'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { cartService } from '@/services/cart.service';

export function CartDropdown() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    retry: 1,
    staleTime: 1000 * 60,
  });

  const removeMutation = useMutation({
    mutationFn: (variantId: string) => cartService.removeFromCart(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

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
        delay={10}
        closeDelay={100}
        className="relative flex items-center justify-center cursor-pointer h-11 w-11 rounded-full bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 transition-all shadow-sm hover:shadow-md hover:scale-105 group z-50"
      >
        <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-200 transition-transform group-hover:rotate-[-10deg]" />
        {itemCount > 0 && (
          <Badge className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold h-5 w-5 p-0 flex items-center justify-center shadow-sm shadow-rose-500/30 animate-in zoom-in border-2 border-white/80 dark:border-gray-900">
            {itemCount}
          </Badge>
        )}
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        sideOffset={16}
        className="w-[380px] p-0 relative overflow-hidden bg-white/40 dark:bg-gray-950/40 backdrop-blur-2xl saturate-150 border border-white/60 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2"
      >
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-[#008080]/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-[#20B2AA]/20 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/40 dark:border-white/5 flex justify-between items-center bg-white/30 dark:bg-black/20">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#008080]" />
              <span className="font-bold text-sm text-gray-800 dark:text-gray-100">سبد خرید شما</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-[#008080]/15 dark:bg-[#008080]/30 text-[#008080] dark:text-[#20B2AA] hover:bg-[#008080]/20 border border-white/50 dark:border-white/5 px-2 rounded-lg font-bold"
            >
              {itemCount} کالا
            </Badge>
          </div>

          {/* Items List */}
          <div className="max-h-[320px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center p-2 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5"
                >
                  <Skeleton className="h-16 w-16 rounded-xl shrink-0 bg-gray-200/50 dark:bg-gray-700/50" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-full bg-gray-200/50 dark:bg-gray-700/50" />
                    <Skeleton className="h-3 w-2/3 bg-gray-200/50 dark:bg-gray-700/50" />
                  </div>
                </div>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 items-center p-2.5 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 group border border-white/50 dark:border-white/5 hover:border-white/80 dark:hover:border-white/10 shadow-sm hover:shadow-md"
                >
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-white/60 dark:border-white/10 bg-white/50 dark:bg-gray-900/50">
                    <Image
                      src={item.image || 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png'}
                      alt={item.productTitle}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-14">
                    <h4
                      className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate leading-relaxed"
                      title={item.productTitle}
                    >
                      {item.productTitle}
                    </h4>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex flex-col items-start">
                        {Number(item.originalPrice) > Number(item.price) && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {(Number(item.originalPrice) || 0).toLocaleString('fa-IR')} تومان
                          </span>
                        )}
                        <p className="text-sm text-[#008080] dark:text-[#20B2AA] font-bold tracking-tight">
                          {(Number(item.price) || 0).toLocaleString('fa-IR')}{' '}
                          <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">تومان</span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">× {item.quantity}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMutation.mutate(item.variantId)}
                    disabled={removeMutation.isPending}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 hover:bg-rose-500/20 dark:hover:bg-rose-500/30 transition-all shrink-0 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">سبد خرید شما خالی است</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-white/30 dark:bg-black/20 border-t border-white/40 dark:border-white/5 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">مبلغ قابل پرداخت:</span>
                <span className="text-base font-extrabold text-gray-900 dark:text-white">
                  {(Number(total) || 0).toLocaleString('fa-IR')}{' '}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">تومان</span>
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button onClick={handleCheckoutClick} className="w-full bg-gradient-to-r from-[#008080] to-[#20B2AA] hover:from-[#006666] hover:to-[#008080] text-white shadow-[0_8px_20px_-6px_rgba(0,128,128,0.4)] rounded-xl h-11 text-sm font-semibold transition-all hover:scale-[1.02] border-none border border-white/20">
                    ثبت سفارش <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                <Link href="/cart" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-10 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#008080] dark:hover:text-[#20B2AA] border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-sm"
                  >
                    مشاهده سبد خرید
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
