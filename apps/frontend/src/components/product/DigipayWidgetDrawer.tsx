'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { InstallmentPlan } from '@/hooks/useDigipayInstallment';

interface DigipayWidgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plans: InstallmentPlan[];
  productTitle: string;
  priceTomans: number;
  onPurchase: (planId: string) => void;
  isPurchasing: boolean;
}

export function DigipayWidgetDrawer({
  isOpen,
  onClose,
  plans,
  productTitle,
  priceTomans,
  onPurchase,
  isPurchasing,
}: DigipayWidgetDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer content sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] border-t border-white/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 p-6 text-white shadow-[0_-20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:mx-auto md:max-w-2xl"
            dir="rtl"
          >
            {/* Ambient liquid glow background element */}
            <div className="absolute top-[-100px] left-1/2 h-[200px] w-[300px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />
            <div className="absolute bottom-0 right-10 h-[150px] w-[150px] rounded-full bg-violet-600/10 blur-[60px]" />

            {/* Drag handle line */}
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-700" />

            {/* Header */}
            <div className="relative mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-xs font-black tracking-wider uppercase">طرح‌های اقساطی دیجی‌پی</span>
                </div>
                <h3 className="text-xl font-black text-zinc-100 mt-1 leading-tight">
                  جزئیات خرید اعتباری و اقساط
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[90%] truncate">
                  {productTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-zinc-800/80 p-2 hover:bg-zinc-700/85 transition-colors border border-white/10"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Total order price badge */}
            <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-400">قیمت نقدی محصول:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-zinc-100">{priceTomans.toLocaleString('fa-IR')}</span>
                <span className="text-xs text-zinc-400 font-bold">تومان</span>
              </div>
            </div>

            {/* Dynamic list of plans */}
            <div className="space-y-4 mb-6">
              {plans.map((plan) => {
                const isBNPL = plan.id === 'bnpl';
                return (
                  <div
                    key={plan.id}
                    className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-cyan-500/30"
                  >
                    {isBNPL && (
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-1 rounded-br-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Zap className="h-3 w-3 text-white fill-white" />
                        <span>پیشنهاد ویژه بدون کارمزد</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mt-2 sm:mt-0">
                      <div>
                        <h4 className="text-base font-black text-zinc-200 flex items-center gap-2">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-xs font-bold text-zinc-400">قسط ماهیانه</div>
                        <div className="flex items-baseline gap-1 mt-1 text-cyan-400 font-black">
                          <span className="text-xl sm:text-2xl">{plan.monthlyPayment.toLocaleString('fa-IR')}</span>
                          <span className="text-[10px] font-bold text-zinc-400">تومان</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-zinc-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          تعداد اقساط: {plan.installmentsCount.toLocaleString('fa-IR')} ماهه
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          کارمزد: {plan.interestPercentage === 0 ? '۰٪ (بدون سود)' : `${plan.interestPercentage.toLocaleString('fa-IR')}٪`}
                        </span>
                      </div>

                      <button
                        onClick={() => onPurchase(plan.id)}
                        disabled={isPurchasing}
                        className="rounded-xl px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-black hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all text-xs shrink-0"
                      >
                        انتخاب و خرید اقساطی
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Safety & process checklist badge */}
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 mb-6 text-xs text-zinc-400 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-300 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>مزایای خرید اعتباری با دیجی‌پی:</span>
              </div>
              <p>✓ ثبت‌نام آنلاین و تمام الکترونیکی در کمتر از ۱۰ دقیقه بدون مراجعه حضوری.</p>
              <p>✓ تخصیص اعتبار خرید فوری بدون نیاز به ضامن ضابطه‌مند (فقط با چک صیادی یا سفته الکترونیک).</p>
              <p>✓ فعال‌سازی آنی سبد خرید و شروع اقساط پس از تحویل نهایی کالا.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
