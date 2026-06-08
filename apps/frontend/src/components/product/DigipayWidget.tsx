'use client';

import React, { useState } from 'react';
import { useDigipayInstallment } from '@/hooks/useDigipayInstallment';
import { DigipayWidgetDrawer } from './DigipayWidgetDrawer';
import { Sparkles, ArrowLeft, Percent } from 'lucide-react';
import { cartService } from '@/services/cart.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DigipayWidgetProps {
  productTitle: string;
  priceTomans: number;
  productId: string;
  variantId?: string;
}

export function DigipayWidget({
  productTitle,
  priceTomans,
  productId,
  variantId,
}: DigipayWidgetProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { plans, bestStartingPlan, formattedStartingPayment, hasPlans } = useDigipayInstallment(priceTomans);

  if (!hasPlans || !bestStartingPlan) return null;

  const handlePurchasePlan = async (planId: string) => {
    setIsAdding(true);
    try {
      const activeVariantId = variantId || productId;
      
      // Add product to cart
      toast.loading('در حال آماده‌سازی سبد خرید اقساطی...', { id: 'digipay-widget-add' });
      await cartService.addToCart({
        variantId: activeVariantId,
        quantity: 1,
      });

      toast.success('محصول به سبد اضافه شد. در حال هدایت به تسویه حساب...', { id: 'digipay-widget-add' });
      
      // Redirect to checkout with digipay gateway preset parameter
      setIsDrawerOpen(false);
      router.push('/checkout?gateway=digipay');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      toast.error('خطا در آماده‌سازی سبد خرید اقساطی. لطفاً دوباره تلاش کنید.', { id: 'digipay-widget-add' });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div dir="rtl" className="w-full">
      {/* Dynamic pricing card in Cyber-Minimal aesthetic */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="relative w-full overflow-hidden rounded-2xl border border-sky-400/25 bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-transparent p-4.5 text-right transition-all duration-300 hover:border-sky-400/40 hover:bg-sky-500/15 group shadow-sm"
      >
        {/* Soft glowing ambient circle behind icon */}
        <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-sky-500/10 blur-xl group-hover:bg-sky-500/20 transition-all duration-500" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-500 dark:text-sky-400">خرید اقساطی دیجی‌پی</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  <Percent className="h-2.5 w-2.5" />
                  بدون کارمزد (BNPL)
                </span>
              </div>
              <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 mt-1 leading-snug">
                خرید این محصول شروع از ماهانه{' '}
                <span className="text-base font-black text-sky-600 dark:text-sky-400">
                  {formattedStartingPayment}
                </span>{' '}
                تومان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-black text-sky-600 dark:text-sky-400 shrink-0 group-hover:translate-x-[-4px] transition-transform duration-300">
            <span>مشاهده شرایط</span>
            <ArrowLeft className="h-4 w-4" />
          </div>
        </div>
      </button>

      {/* Slide-in details sheets */}
      <DigipayWidgetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        plans={plans}
        productTitle={productTitle}
        priceTomans={priceTomans}
        onPurchase={handlePurchasePlan}
        isPurchasing={isAdding}
      />
    </div>
  );
}
