'use client';

import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import type { Cart } from '@/services/cart.service';
import type { ShippingMethod } from '@/services/shipping.service';
import { motion } from 'framer-motion';

interface CheckoutSummaryProps {
  cart: Cart;
  shippingCost: number;
  selectedShippingMethod?: ShippingMethod;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function CheckoutSummary({
  cart,
  shippingCost,
  selectedShippingMethod,
  onSubmit,
  isSubmitting = false,
}: CheckoutSummaryProps) {
  const cartSubtotal = Number(cart.totalPrice) || 0;
  const discount = 0;
  const numericShippingCost = Number(shippingCost) || 0;
  const total = cartSubtotal + numericShippingCost - discount;
  const itemCount = Number(cart.totalItems) || 0;

  return (
    <div className="sticky top-24 space-y-4 font-bold" dir="rtl">
      <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden">
        {/* Subtle ambient blur */}
        <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-[#008080]/10 rounded-full blur-[40px] pointer-events-none" />

        <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#008080] dark:bg-[#20B2AA] rounded-full inline-block" />
          خلاصه سفارش
        </h2>

        {/* Cart Items Summary */}
        <div className="mb-6 space-y-3.5 max-h-48 overflow-y-auto custom-scrollbar pl-1">
          {cart.items.map((item) => (
            <div key={item.variantId} className="flex justify-between items-start text-xs bg-white/20 dark:bg-white/5 p-3 rounded-xl border border-white/30 dark:border-white/5">
              <div className="flex-1 min-w-0 pr-1">
                <p className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate">{item.productTitle}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-bold">
                  تعداد سفارش: {item.quantity.toLocaleString('fa-IR')} عدد
                </p>
              </div>
              <div className="text-left shrink-0 pl-1">
                {Number(item.originalPrice) > Number(item.price) && (
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 line-through mb-0.5">
                    {((Number(item.originalPrice) || 0) * (Number(item.quantity) || 0)).toLocaleString('fa-IR')}
                  </p>
                )}
                <span className="font-black text-zinc-800 dark:text-zinc-200">
                  {((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString('fa-IR')}{' '}
                  <span className="text-[9px] font-normal text-zinc-400">تومان</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-white/40 dark:border-white/5 pt-5 mb-6">
          <div className="flex justify-between items-center">
            <span>جمع کل کالاها ({itemCount.toLocaleString('fa-IR')} مورد)</span>
            <span className="text-zinc-800 dark:text-zinc-200">
              {cartSubtotal.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>هزینه حمل و ارسال</span>
            {selectedShippingMethod?.is_pay_on_delivery ? (
              <span className="text-amber-500 font-extrabold">پس کرایه (پرداخت در محل)</span>
            ) : (
              <>
                {numericShippingCost > 0 ? (
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {numericShippingCost.toLocaleString('fa-IR')} تومان
                  </span>
                ) : (
                  <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">رایگان (ویژه)</span>
                )}
              </>
            )}
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-rose-500">
              <span>تخفیف</span>
              <span>- {discount.toLocaleString('fa-IR')} تومان</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center font-black text-sm mb-6 border-t border-white/40 dark:border-white/5 pt-4">
          <span className="text-zinc-700 dark:text-zinc-300">جمع مبلغ نهایی</span>
          <span className="text-zinc-900 dark:text-white text-base">
            {total.toLocaleString('fa-IR')}{' '}
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mr-0.5">تومان</span>
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#008080] to-[#20B2AA] hover:from-[#006666] hover:to-[#008080] text-white shadow-lg shadow-[#008080]/15 hover:shadow-[#008080]/30 rounded-xl h-11.5 text-xs font-black transition-all border-none group"
          >
            {isSubmitting ? 'در حال ثبت نهایی سفارش...' : 'پرداخت و ثبت نهایی سفارش'}
            {!isSubmitting && (
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            )}
          </Button>
        </motion.div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-4.5 leading-relaxed font-extrabold">
          با ثبت نهایی، قوانین و مقررات سایت را می‌پذیرم.
        </p>
      </div>

      <div className="bg-white/30 dark:bg-zinc-950/20 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl p-4.5 flex items-center gap-3">
        <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/15">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200">سیستم پرداخت امن بانکی</h4>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-bold">کلیه تبادلات مالی ۱۰۰٪ رمزنگاری و تضمین شده هستند.</p>
        </div>
      </div>
    </div>
  );
}
