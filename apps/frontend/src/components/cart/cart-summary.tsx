'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number;
  onCheckout?: () => void;
  isSubmitting?: boolean;
}

export function CartSummary({ subtotal, shippingCost = 0, onCheckout, isSubmitting = false }: CartSummaryProps) {
  const safeSubtotal = Number(subtotal) || 0;
  const numericShippingCost = Number(shippingCost) || 0;
  const total = safeSubtotal + numericShippingCost;

  return (
    <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] p-6.5 sticky top-24 relative overflow-hidden" dir="rtl">
      {/* Subtle top glow */}
      <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#008080]/10 rounded-full blur-[40px] pointer-events-none" />

      <h3 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-[#008080] dark:bg-[#20B2AA] rounded-full inline-block" />
        خلاصه سفارش
      </h3>

      <div className="space-y-4 text-xs font-bold text-zinc-500 dark:text-zinc-400">
        <div className="flex justify-between items-center">
          <span>جمع مبلغ کالاها</span>
          <span className="text-zinc-800 dark:text-zinc-200">
            {safeSubtotal.toLocaleString('fa-IR')}{' '}
            <span className="text-[10px] font-normal text-zinc-400 mr-0.5">تومان</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>هزینه ارسال سفارش</span>
          <span className="text-[#008080] dark:text-[#20B2AA] font-black">
            {numericShippingCost === 0 ? 'رایگان (ویژه)' : `${numericShippingCost.toLocaleString('fa-IR')} تومان`}
          </span>
        </div>

        <Separator className="bg-white/50 dark:bg-white/5 my-4" />

        <div className="flex justify-between items-center py-1">
          <span className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">مبلغ قابل پرداخت</span>
          <span className="font-black text-lg text-zinc-900 dark:text-white flex items-end">
            {total.toLocaleString('fa-IR')}
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mr-1 mb-0.5">تومان</span>
          </span>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="mt-6"
      >
        <Button
          onClick={onCheckout}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#008080] to-[#20B2AA] hover:from-[#006666] hover:to-[#008080] text-white shadow-lg shadow-[#008080]/15 hover:shadow-[#008080]/30 rounded-xl h-11.5 text-xs font-black transition-all border-none group"
        >
          {isSubmitting ? 'در حال پردازش...' : 'ثبت سفارش و ادامه'}
          {!isSubmitting && (
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          )}
        </Button>
      </motion.div>

      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-white/20 dark:bg-black/10 py-2.5 rounded-xl border border-white/30 dark:border-white/5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        <span>تضمین اصالت کالا و پرداخت امن بانکی</span>
      </div>
    </div>
  );
}
