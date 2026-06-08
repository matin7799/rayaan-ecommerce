'use client';

import React, { useMemo, useState } from 'react';
import { useCategories } from '@/lib/hooks/queries/useCategories';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { Monitor, Smartphone, Laptop, Printer, Gamepad2, Cpu, ChevronRight, Loader2, Layers, DollarSign, Tag } from 'lucide-react';
import type { Category } from '@/services';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  laptop: Laptop,
  mobile: Smartphone,
  console: Gamepad2,
  monitor: Monitor,
  printer: Printer,
  pc: Cpu,
  computer: Monitor,
  gaming: Gamepad2,
  accessories: Layers,
};

// Price ranges for different categories
const priceRanges = [
  { label: 'اقتصادی', range: 'تا 30 میلیون تومان', min: 0, max: 10000000 },
  { label: 'میان‌رده', range: '30 تا 60 میلیون تومان', min: 10000000, max: 30000000 },
  { label: 'پرچمدار', range: '60 تا 100 میلیون تومان', min: 30000000, max: 60000000 },
  { label: 'پریمیوم', range: 'بالای 100 میلیون تومان', min: 60000000, max: 999999999 },
];

// Popular brands by category type
const brandsByCategory: Record<string, string[]> = {
  mobile: ['اپل (Apple)', 'سامسونگ (Samsung)', 'شیائومی (Xiaomi)', 'نوکیا (Nokia)'],
  laptop: ['اپل (Apple)', 'ایسوس (ASUS)', 'لنوو (Lenovo)', 'اچ‌پی (HP)', 'دل (Dell)', 'ام‌اس‌آی (MSI)'],
  console: ['سونی (Sony)', 'مایکروسافت (Microsoft)', 'نینتندو (Nintendo)'],
  monitor: ['ال‌جی (LG)', 'سامسونگ (Samsung)', 'ایسوس (ASUS)', 'ام‌اس‌آی (MSI)'],
  printer: ['اچ‌پی (HP)', 'کانن (Canon)', 'اپسون (Epson)', 'برادر (Brother)'],
  pc: ['اینتل (Intel)', 'ای‌ام‌دی (AMD)', 'انویدیا (Nvidia)', 'ایسوس (ASUS)'],
  computer: ['اپل (Apple)', 'ایسوس (ASUS)', 'لنوو (Lenovo)', 'اچ‌پی (HP)'],
  gaming: ['ام‌اس‌آی (MSI)', 'ایسوس (ASUS)', 'ریزر (Razer)', 'لوجیتک (Logitech)'],
  accessories: ['لوجیتک (Logitech)', 'ریزر (Razer)', 'انکر (Anker)', 'بلکین (Belkin)'],
};

const defaultBrands = ['اپل (Apple)', 'سامسونگ (Samsung)', 'ایسوس (ASUS)', 'اچ‌پی (HP)'];

export function MegaMenu() {
  const { data: categories, isLoading } = useCategories();
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  const parentCategories = useMemo(() => {
    return categories?.filter((cat) => !cat.parentId) || [];
  }, [categories]);

  const activeCategory = hoveredCategory ?? parentCategories[0] ?? null;

  const getIcon = (slug: string) => {
    const Icon = iconMap[slug] || Layers;
    return Icon;
  };

  const getBrands = (slug: string): string[] => {
    return brandsByCategory[slug] || defaultBrands;
  };

  if (isLoading) {
    return (
      <NavigationMenu dir="rtl">
        <NavigationMenuList>
          <NavigationMenuItem>
            <div className="flex items-center gap-2 px-4 h-9 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              در حال بارگذاری...
            </div>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  if (!parentCategories || parentCategories.length === 0) {
    return null;
  }

  return (
    <NavigationMenu dir="rtl">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:text-[#008080] font-bold text-sm transition-colors h-9 px-4">
            دسته‌بندی کالاها
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0 border-none bg-transparent shadow-none">
            {/* بدنه اصلی مگامنو: گلس‌مورفیسم حرفه‌ای */}
            <div className="w-[850px] min-h-[420px] flex flex-row-reverse p-0 overflow-hidden rounded-3xl mt-2 relative 
              bg-white/40 dark:bg-gray-950/40 backdrop-blur-2xl saturate-150 
              border border-white/60 dark:border-white/10 
              shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
              
              {/* هاله‌های رنگی (Blobs) برای زیباتر شدن افکت شیشه‌ای */}
              <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-[#008080]/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-[#20B2AA]/20 rounded-full blur-[80px] pointer-events-none" />

              {/* محتوای اصلی (زیردسته‌ها، برندها و قیمت) */}
              <div className="w-[68%] p-10 grid grid-cols-3 gap-8 z-10">
                
                {/* ستون اول: زیردسته‌ها */}
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-900/10 dark:border-white/10 text-base flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    دسته‌های {activeCategory?.name}
                  </h4>
                  {activeCategory?.children && activeCategory.children.length > 0 ? (
                    <ul className="space-y-3">
                      {activeCategory.children.slice(0, 8).map((child) => (
                        <li key={child.id} className="group">
                          <Link
                            href={`/products/category/${child.slug}`}
                            className="text-sm font-medium text-gray-700 hover:text-[#008080] dark:text-gray-300 dark:hover:text-[#20B2AA] transition-all duration-300 flex items-center gap-3 group-hover:translate-x-2"
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-0 group-hover:opacity-40 transition-opacity"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300 dark:bg-gray-600 group-hover:bg-[#008080] transition-colors"></span>
                            </span>
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      زیردسته‌ای موجود نیست
                    </p>
                  )}
                </div>

                {/* ستون دوم: برندها */}
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-900/10 dark:border-white/10 text-base flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    برندهای برتر
                  </h4>
                  <ul className="space-y-3">
                    {getBrands(activeCategory?.slug || '').map((brand, i) => (
                      <li key={i} className="group">
                        <Link
                          href={`/products?search=${encodeURIComponent(brand.split('(')[0].trim())}`}
                          className="text-sm font-medium text-gray-700 hover:text-[#008080] dark:text-gray-300 dark:hover:text-[#20B2AA] transition-all duration-300 flex items-center gap-3 group-hover:translate-x-2"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-0 group-hover:opacity-40 transition-opacity"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300 dark:bg-gray-600 group-hover:bg-[#008080] transition-colors"></span>
                          </span>
                          {brand}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ستون سوم: محدوده قیمت */}
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-900/10 dark:border-white/10 text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    خرید بر اساس قیمت
                  </h4>
                  <ul className="space-y-3">
                    {priceRanges.map((priceRange, i) => (
                      <li key={i} className="group">
                        <Link
                          href={`/products/category/${activeCategory?.slug}?minPrice=${priceRange.min}&maxPrice=${priceRange.max}`}
                          className="text-sm font-medium text-gray-700 hover:text-[#008080] dark:text-gray-300 dark:hover:text-[#20B2AA] transition-all duration-300 flex items-center gap-3 group-hover:translate-x-2"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-0 group-hover:opacity-40 transition-opacity"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300 dark:bg-gray-600 group-hover:bg-[#008080] transition-colors"></span>
                          </span>
                          <div className="flex flex-col">
                            <span className="font-bold">{priceRange.label}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{priceRange.range}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* سایدبار دسته‌ها (سمت راست) */}
              <div className="w-[32%] bg-white/30 dark:bg-black/20 border-r border-white/40 dark:border-white/5 p-4 flex flex-col gap-2 z-10">
                {parentCategories.map((cat) => {
                  const Icon = getIcon(cat.slug);
                  return (
                  <Link
                    key={cat.id}
                    href={`/products/category/${cat.slug}`}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative group
                      ${activeCategory?.id === cat.id
                        ? 'bg-white/80 dark:bg-white/10 text-[#008080] dark:text-[#20B2AA] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/60 dark:border-white/10 scale-[1.02]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/5 hover:translate-x-1'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-transform duration-300 
                        ${activeCategory?.id === cat.id ? 'scale-110 drop-shadow-sm' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-200'}`} 
                      />
                      {cat.name}
                    </div>
                    {activeCategory?.id === cat.id && (
                      <ChevronRight className="w-4 h-4 animate-in slide-in-from-left-2 opacity-80" />
                    )}
                  </Link>
                  );
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
