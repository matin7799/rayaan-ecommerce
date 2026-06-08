'use client';

import { Truck, Check } from 'lucide-react';
import { ShippingMethod as ShippingMethodType } from '@/services/shipping.service';
import { motion } from 'framer-motion';

interface ShippingMethodProps {
  shippingMethods: ShippingMethodType[];
  selectedMethodId: string;
  onMethodSelect: (id: string) => void;
}

export function ShippingMethod({ shippingMethods, selectedMethodId, onMethodSelect }: ShippingMethodProps) {
  return (
    <section className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden" dir="rtl">
      {/* Dynamic ambient highlight */}
      <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-[#008080]/5 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex items-center gap-2.5 text-[#008080] dark:text-[#20B2AA] mb-6 font-bold">
        <div className="p-2 rounded-xl bg-[#008080]/10 border border-[#008080]/15 dark:border-white/5">
          <Truck className="w-5 h-5" />
        </div>
        <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100">روش ارسال سفارش</h2>
      </div>

      {shippingMethods.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 font-extrabold text-xs">
          <p>روش ارسالی در حال حاضر موجود نیست</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {shippingMethods.map((method) => {
            const isSelected = selectedMethodId === method.id;

            return (
              <motion.div
                key={method.id}
                onClick={() => onMethodSelect(method.id)}
                whileHover={{ scale: 1.008 }}
                whileTap={{ scale: 0.995 }}
                className={`
                  relative p-4.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4
                  ${isSelected
                    ? 'border-[#008080]/50 bg-[#008080]/5 ring-2 ring-[#008080]/15'
                    : 'border-zinc-200/50 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:border-[#008080]/30'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#008080] flex items-center justify-center shadow-md shadow-[#008080]/20 animate-in zoom-in duration-200">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-1 flex gap-3.5 items-start">
                  <div className="space-y-1.5 min-w-0">
                    <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">{method.name}</p>
                    {method.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed line-clamp-1">{method.description}</p>
                    )}
                    {method.estimated_days && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">
                        مدت زمان تقریبی تحویل: {method.estimated_days.toLocaleString('fa-IR')} روز کاری
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left shrink-0 pl-4.5 self-center">
                  {method.is_pay_on_delivery ? (
                    <p className="font-black text-xs text-amber-500 bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded-xl">
                      پس کرایه
                    </p>
                  ) : Number(method.cost) > 0 ? (
                    <p className="font-black text-sm text-[#008080] dark:text-[#20B2AA]">
                      {Number(method.cost).toLocaleString('fa-IR')}{' '}
                      <span className="text-[10px] font-bold text-zinc-400 mr-0.5">تومان</span>
                    </p>
                  ) : (
                    <p className="font-black text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-xl">
                      رایگان
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
