'use client';

import { CreditCard, Sparkles, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PaymentMethodProps {
  selectedGateway: 'zarinpal' | 'digipay';
  onGatewayChange: (gateway: 'zarinpal' | 'digipay') => void;
}

const gatewayOptions = [
  {
    id: 'zarinpal',
    title: 'پرداخت آنلاین زرین‌پال',
    description: 'پرداخت سریع با کلیه کارت‌های شتاب بانکی کشور',
    icon: CreditCard,
    badge: null,
    colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/15',
    activeRing: 'border-sky-500/50 bg-sky-500/5 ring-sky-500/15',
  },
  {
    id: 'digipay',
    title: 'تسهیلات اقساطی و BNPL دیجی‌پی',
    description: 'خرید اعتباری بدون کارمزد، تسهیلات اقساطی و کیف‌پول دیجی‌پی',
    icon: Sparkles,
    badge: 'پیشنهاد خرید اعتباری',
    colorClass: 'text-[#008080] bg-[#008080]/10 border-[#008080]/15',
    activeRing: 'border-[#008080]/50 bg-[#008080]/5 ring-[#008080]/15',
  },
] as const;

export function PaymentMethod({ selectedGateway, onGatewayChange }: PaymentMethodProps) {
  return (
    <section className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-6.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden" dir="rtl">
      {/* Dynamic ambient highlight */}
      <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex items-center gap-2.5 text-sky-500 mb-6 font-bold">
        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/15">
          <Landmark className="w-5 h-5" />
        </div>
        <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100">روش پرداخت و درگاه بانکی</h2>
      </div>

      <div className="space-y-3.5">
        {gatewayOptions.map((gateway) => {
          const Icon = gateway.icon;
          const isSelected = selectedGateway === gateway.id;

          return (
            <motion.label
              key={gateway.id}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.995 }}
              className={`relative flex items-start sm:items-center gap-4.5 p-4.5 border-2 rounded-2xl transition-all cursor-pointer ${
                isSelected
                  ? `${gateway.activeRing} ring-2`
                  : 'border-zinc-200/50 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:border-sky-500/30'
              }`}
            >
              {gateway.badge && (
                <span className="absolute top-0 left-5 bg-gradient-to-r from-[#008080] to-[#20B2AA] text-white text-[9px] font-black px-2.5 py-0.5 rounded-b-lg shadow-md shadow-[#008080]/10">
                  {gateway.badge}
                </span>
              )}

              <div className="flex items-center h-5 shrink-0 mt-1.5 sm:mt-0">
                <input
                  type="radio"
                  name="payment_gateway"
                  checked={isSelected}
                  onChange={() => onGatewayChange(gateway.id as 'zarinpal' | 'digipay')}
                  className="h-4.5 w-4.5 accent-sky-500 dark:accent-sky-400 bg-transparent cursor-pointer"
                />
              </div>

              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`p-2.5 rounded-xl shrink-0 border ${isSelected ? gateway.colorClass : 'bg-zinc-100/55 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-600 border-zinc-200/40 dark:border-white/5'}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 leading-snug">{gateway.title}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-1 leading-relaxed line-clamp-2">{gateway.description}</div>
                </div>
              </div>
            </motion.label>
          );
        })}
      </div>
    </section>
  );
}
