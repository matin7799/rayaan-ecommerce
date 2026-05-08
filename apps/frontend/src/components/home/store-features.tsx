import { Truck, ShieldCheck, HeadphonesIcon, CreditCard } from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'ارسال سریع و رایگان',
    description: 'سفارش‌های بالای ۲ میلیون',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: ShieldCheck,
    title: 'ضمانت اصالت کالا',
    description: 'تضمین کیفیت و اصل بودن',
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: HeadphonesIcon,
    title: 'پشتیبانی ۲۴/۷',
    description: 'همیشه در کنار شما هستیم',
    color: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: CreditCard,
    title: 'پرداخت امن',
    description: 'تضمین امنیت تراکنش‌ها',
    color: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
];

export function StoreFeatures() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 my-8">
      {FEATURES.map((feature, index) => (
        <div 
          key={index} 
          className="group relative flex items-center gap-5 p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle Hover Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
          
          {/* Icon */}
          <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-800 shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner ${feature.iconColor}`}>
            <feature.icon className="w-7 h-7" strokeWidth={1.5} />
          </div>
          
          {/* Text */}
          <div className="relative z-10">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
