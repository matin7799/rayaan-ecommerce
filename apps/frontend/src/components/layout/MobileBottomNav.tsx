'use client';

import Link from 'next/link';
import { Home, LayoutGrid, ShoppingCart, User, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MobileBottomNav() {
  const pathname = usePathname();

  // تنظیم ۵ آیتم. دکمه اصلی (خانه) در ایندکس ۲ (وسط) قرار می‌گیرد.
  const navItems = [
    { name: 'دسته‌ها', icon: LayoutGrid, href: '/categories' },
    { name: 'علاقه‌مندی', icon: Heart, href: '/wishlist' },
    { name: 'خانه', icon: Home, href: '/', isCenter: true },
    { name: 'سبد خرید', icon: ShoppingCart, href: '/cart', badge: 3 },
    { name: 'پروفایل', icon: User, href: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* پس‌زمینه گلس‌مورفیسم */}
      <div className="absolute inset-0 bg-white/85 dark:bg-gray-950/85 backdrop-blur-2xl saturate-150 border-t border-gray-200/50 dark:border-gray-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe" />
      
      <div className="relative flex items-end justify-around px-2 pb-2 h-[70px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          // طراحی دکمه مرکزی و برجسته (خانه)
          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center justify-center group z-10 -mt-8" // -mt-8 برای بیرون زدگی
              >
                <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-[#008080]/30 transition-transform duration-300 active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-[#008080] to-[#20B2AA] text-white shadow-[#008080]/50' 
                    : 'bg-gradient-to-tr from-[#008080] to-[#20B2AA] text-white'
                }`}>
                  <item.icon 
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
                <span className={`text-[10px] mt-1.5 transition-all duration-300 ${isActive ? 'font-bold text-[#008080] dark:text-[#20B2AA]' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          }

          // طراحی ۴ دکمه دیگر (عادی)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full pb-1 pt-3 gap-1.5 transition-all duration-300 ${
                isActive 
                  ? 'text-[#008080] dark:text-[#20B2AA]' 
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <item.icon 
                  className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'scale-100 hover:-translate-y-1'}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                
                {/* نشانگر (Badge) برای سبد خرید و... */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950 shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.name}
              </span>
              
              {/* نشانگر اکتیو بودن (نقطه زیر آیکون) */}
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#008080] dark:bg-[#20B2AA] animate-in zoom-in" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
