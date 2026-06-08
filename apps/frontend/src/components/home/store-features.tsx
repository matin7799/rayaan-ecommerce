import { Truck, ShieldCheck, HeadphonesIcon, CreditCard } from 'lucide-react';

const FEATURES = [
  {
    id: 'fast-shipping',
    icon: Truck,
    title: 'ارسال سریع و رایگان',
    description: 'سفارش‌های بالای ۲ میلیون',
    color: 'from-blue-500/15 to-cyan-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'authenticity',
    icon: ShieldCheck,
    title: 'ضمانت اصالت کالا',
    description: 'تضمین کیفیت و اصل بودن',
    color: 'from-emerald-500/15 to-teal-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'support',
    icon: HeadphonesIcon,
    title: 'پشتیبانی ۲۴/۷',
    description: 'همیشه در کنار شما هستیم',
    color: 'from-violet-500/15 to-purple-500/15',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'secure-payment',
    icon: CreditCard,
    title: 'پرداخت امن',
    description: 'تضمین امنیت تراکنش‌ها',
    color: 'from-orange-500/15 to-red-500/15',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
];

export function StoreFeatures() {
  return (
    <section className="container mx-auto px-4 md:px-8 mt-4 sm:mt-6 lg:mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-neutral-200/70 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-5 shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />

            <div
              className={`relative z-10 flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-neutral-800 shadow-inner transition-transform duration-300 group-hover:scale-105 ${feature.iconColor}`}
            >
              <feature.icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.7} />
            </div>

            <div className="relative z-10 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white transition-colors group-hover:text-primary leading-6">
                {feature.title}
              </h3>
              <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-5">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
