// apps/frontend/src/app/(shop)/payment/callback/page.tsx
'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Calendar, ShoppingBag, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useVerifyPayment } from '@/hooks/useVerifyPayment';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const refId = searchParams.get('refId');
  const authority = searchParams.get('authority');
  // Backend sets status='success'|'failed' in the redirect URL after processing callback
  const gatewayStatus = searchParams.get('status');

  const { isLoading, isVerified, error, order } = useVerifyPayment(orderId, gatewayStatus);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl relative" dir="rtl">
      {/* Dynamic ambient gradients */}
      <div className="absolute top-[20%] right-[10%] w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Premium loading loader in liquid glass */
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-white/40 dark:bg-zinc-950/45 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/10 rounded-3xl p-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative z-10 flex flex-col items-center py-10">
              <Loader2 className="w-12 h-12 animate-spin text-[#008080] dark:text-[#20B2AA] mb-6" />
              <h2 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 mb-2">در حال تأیید نهایی پرداخت</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm leading-relaxed animate-pulse">
                لطفاً شکیبا باشید؛ سیستم در حال بررسی و تأیید تراکنش اعتباری شما از سرور مرکزی دیجی‌پی است...
              </p>
            </div>
          </motion.div>
        ) : isVerified ? (
          /* Successful payment card */
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="relative overflow-hidden bg-white/45 dark:bg-zinc-950/40 backdrop-blur-2xl border border-emerald-500/20 dark:border-emerald-500/15 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(16,185,129,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Ambient success highlight */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-20 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Animated checkmark wrapper */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto mb-6 border border-emerald-500/20 shadow-md shadow-emerald-500/5"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-3">پرداخت با موفقیت انجام شد</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold max-w-md mx-auto mb-8 leading-relaxed">
                تراکنش شما با موفقیت تأیید گردید و سفارش شما در صف پردازش و بسته‌بندی قرار گرفت.
              </p>

              {/* Transaction details card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 mb-8 text-right text-xs text-zinc-600 dark:text-zinc-300 font-bold">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>تاریخ تراکنش:</span>
                  <span className="text-zinc-800 dark:text-zinc-100 mr-auto">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>روش پرداخت:</span>
                  <span className="text-zinc-800 dark:text-zinc-100 mr-auto">خرید اعتباری دیجی‌پی</span>
                </div>
                {refId && (
                  <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-zinc-200/30 dark:border-white/5 pt-3.5">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>کد پیگیری دیجی‌پی:</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400 text-sm mr-auto tracking-wide">{refId}</span>
                  </div>
                )}
                {!refId && authority && (
                  <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-zinc-200/30 dark:border-white/5 pt-3.5">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>شناسه مرجع تراکنش:</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400 text-sm mr-auto tracking-wide">{authority}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                {orderId ? (
                  <Link href={`/dashboard/orders/${orderId}`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold shadow-lg shadow-emerald-500/10 rounded-2xl h-12 text-sm transition-all hover:scale-[1.02] border-none">
                      مشاهده فاکتور و سفارش
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/orders" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold shadow-lg shadow-emerald-500/10 rounded-2xl h-12 text-sm transition-all hover:scale-[1.02] border-none">
                      مشاهده سفارش‌ها
                    </Button>
                  </Link>
                )}
                <Link href="/" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full rounded-2xl h-12 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:text-zinc-800 border border-zinc-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-sm">
                    بازگشت به صفحه اصلی
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Failed/Cancelled payment card */
          <motion.div
            key="failure"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="relative overflow-hidden bg-white/45 dark:bg-zinc-950/40 backdrop-blur-2xl border border-rose-500/25 dark:border-rose-500/15 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(244,63,94,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Ambient rose highlight */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-20 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mx-auto mb-6 border border-rose-500/20 shadow-md shadow-rose-500/5"
              >
                <XCircle className="w-12 h-12" />
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mb-3">پرداخت لغو شد یا ناموفق بود</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold max-w-md mx-auto mb-8 leading-relaxed">
                {error || 'عملیات پرداخت شما در درگاه بانکی دیجی‌پی لغو شد یا با شکست مواجه گردید. وجهی از حساب شما کسر نشده است.'}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link href="/cart" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-extrabold shadow-lg shadow-rose-500/10 rounded-2xl h-12 text-sm transition-all hover:scale-[1.02] border-none">
                    بازگشت به سبد خرید <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full rounded-2xl h-12 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:text-zinc-800 border border-zinc-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-sm">
                    بازگشت به صفحه اصلی
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <div className="bg-white/40 dark:bg-zinc-950/45 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/10 rounded-3xl p-10 shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-[#008080] mx-auto mb-4" />
            <p className="text-zinc-500 text-sm font-bold animate-pulse">در حال بررسی فاکتور پرداخت...</p>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
