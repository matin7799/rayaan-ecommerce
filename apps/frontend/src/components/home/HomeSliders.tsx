'use client';

import { useProducts } from '@/lib/hooks/queries/useProducts';
import { ProductSlider } from './ProductSlider';

// 1. Mobile Phones
export function MobilePhonesSlider() {
  const { data, isLoading } = useProducts({ category: 'mobile', limit: 10 });

  return (
    <ProductSlider
      title="جدیدترین گوشی‌های موبایل"
      subtitle="به‌روزترین اسمارت‌فون‌های بازار با بهترین قیمت"
      viewAllLink="/products?category=mobile"
      products={data?.items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 2. Gaming Laptops
export function GamingLaptopSlider() {
  const { data, isLoading } = useProducts({ category: 'laptop', search: 'gaming', limit: 10 });

  return (
    <ProductSlider
      title="سیستم‌های گیمینگ"
      subtitle="قدرت بی‌نهایت برای گیمرهای حرفه‌ای"
      viewAllLink="/products?category=laptop&search=gaming"
      products={data?.items}
      isLoading={isLoading}
      variant="flash"
    />
  );
}

// 3. Budget Laptops
export function BudgetLaptopSlider() {
  const { data, isLoading } = useProducts({ 
    category: 'laptop', 
    maxPrice: 30000000,
    limit: 10 
  });

  return (
    <ProductSlider
      title="لپ‌تاپ‌های اقتصادی"
      subtitle="کارایی بالا، قیمت مناسب برای دانشجویان و دانش‌آموزان"
      viewAllLink="/products?category=laptop&maxPrice=30000000"
      products={data?.items}
      isLoading={isLoading}
      variant="minimal"
    />
  );
}

// 4. Workstation Laptops
export function WorkstationLaptopSlider() {
  const { data, isLoading } = useProducts({ 
    category: 'laptop', 
    search: 'workstation',
    limit: 10 
  });

  return (
    <ProductSlider
      title="ورک‌استیشن‌های پردازشی"
      subtitle="مخصوص رندرینگ، برنامه‌نویسی و کارهای سنگین"
      viewAllLink="/products?category=laptop&search=workstation"
      products={data?.items}
      isLoading={isLoading}
      variant="premium"
    />
  );
}

// 5. Ultrabooks
export function UltrabookSlider() {
  const { data, isLoading } = useProducts({ 
    category: 'laptop', 
    search: 'ultrabook',
    limit: 10 
  });

  return (
    <ProductSlider
      title="اولترابوک‌های سبک و باریک"
      subtitle="همیشه همراه شما با شارژدهی فوق‌العاده"
      viewAllLink="/products?category=laptop&search=ultrabook"
      products={data?.items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 6. Tablets
export function TabletSlider() {
  const { data, isLoading } = useProducts({ category: 'tablet', limit: 10 });

  return (
    <ProductSlider
      title="تبلت‌ها و کتاب‌خوان‌ها"
      subtitle="برای مطالعه، طراحی و سرگرمی"
      viewAllLink="/products?category=tablet"
      products={data?.items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 7. Gaming Consoles
export function ConsoleSlider() {
  const { data, isLoading } = useProducts({ category: 'console', limit: 10 });

  return (
    <ProductSlider
      title="کنسول‌های بازی"
      subtitle="تجربه گیمینگ نسل جدید"
      viewAllLink="/products?category=console"
      products={data?.items}
      isLoading={isLoading}
      variant="flash"
    />
  );
}

// 8. Monitors
export function MonitorSlider() {
  const { data, isLoading } = useProducts({ category: 'monitor', limit: 10 });

  return (
    <ProductSlider
      title="مانیتورها"
      subtitle="نمایشگرهای با کیفیت برای کار و بازی"
      viewAllLink="/products?category=monitor"
      products={data?.items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 9. PC Cases
export function CaseSlider() {
  const { data, isLoading } = useProducts({ category: 'case', limit: 10 });

  return (
    <ProductSlider
      title="کیس‌های کامپیوتر"
      subtitle="طراحی زیبا و خنک‌کاری عالی"
      viewAllLink="/products?category=case"
      products={data?.items}
      isLoading={isLoading}
      variant="minimal"
    />
  );
}

// 10. Printers
export function PrinterSlider() {
  const { data, isLoading } = useProducts({ category: 'printer', limit: 10 });

  return (
    <ProductSlider
      title="پرینترها و اسکنرها"
      subtitle="برای نیازهای اداری و خانگی"
      viewAllLink="/products?category=printer"
      products={data?.items}
      isLoading={isLoading}
      variant="default"
    />
  );
}
