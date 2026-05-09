'use client';

import { useProducts } from '@/lib/hooks/queries/useProducts';
import { ProductSlider } from './ProductSlider';
import type { ProductListItem } from '@/services';

function shouldHideSlider(
  state: {
    isLoading: boolean;
    hasError: boolean;
    items: unknown[] | undefined;
  },
): boolean {
  // Hide only when request is settled, healthy, and definitely empty.
  return !state.isLoading && !state.hasError && Array.isArray(state.items) && state.items.length === 0;
}

function pickItems<T>(
  primaryItems: T[] | undefined,
  fallbackItems: T[] | undefined,
): T[] | undefined {
  if (Array.isArray(primaryItems) && primaryItems.length > 0) {
    return primaryItems;
  }
  return fallbackItems;
}

function normalizeText(value: string | undefined): string {
  return (value ?? '').toLowerCase();
}

function isGamingLaptop(product: ProductListItem): boolean {
  const text = [
    product.title,
    product.slug,
    product.description,
    product.shortDescription,
    ...(product.categories?.map((c) => `${c.name} ${c.slug}`) ?? []),
    ...(product.tags?.map((t) => `${t.name} ${t.slug}`) ?? []),
  ]
    .map(normalizeText)
    .join(' ');

  const isLaptopCategory = (product.categories ?? []).some((category) =>
    normalizeText(`${category.name} ${category.slug}`).includes('laptop') ||
    normalizeText(`${category.name} ${category.slug}`).includes('لپ'),
  );
  const isGaming = /gaming|گیم/.test(text);

  return isLaptopCategory && isGaming;
}

// 1. Mobile Phones
export function MobilePhonesSlider() {
  const primary = useProducts({ search: 'گوشی', limit: 10 });
  const fallback = useProducts({ search: 'mobile', limit: 10 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="جدیدترین گوشی‌های موبایل"
      subtitle="به‌روزترین اسمارت‌فون‌های بازار با بهترین قیمت"
      viewAllLink="/products/category/mobile"
      products={items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 2. Gaming Laptops
export function GamingLaptopSlider() {
  const primary = useProducts({ categorySlugs: ['gaming-laptop'], limit: 20 });
  const fallback = useProducts({ categorySlugs: ['laptop'], search: 'gaming', limit: 50 });
  const merged = pickItems(primary.data?.items, fallback.data?.items) ?? [];
  const items = merged.filter(isGamingLaptop).slice(0, 10);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="سیستم‌های گیمینگ"
      subtitle="قدرت بی‌نهایت برای گیمرهای حرفه‌ای"
      viewAllLink="/products/category/gaming-laptop"
      products={items}
      isLoading={isLoading}
      variant="flash"
    />
  );
}

// 3. Budget Laptops
export function BudgetLaptopSlider() {
  const primary = useProducts({ categorySlugs: ['budget-laptop'], maxPrice: 30000000, limit: 20 });
  const fallback = useProducts({
    search: 'laptop',
    maxPrice: 30000000,
    limit: 10,
  });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="لپ‌تاپ‌های اقتصادی"
      subtitle="کارایی بالا، قیمت مناسب برای دانشجویان و دانش‌آموزان"
      viewAllLink="/products/category/budget-laptop?maxPrice=30000000"
      products={items}
      isLoading={isLoading}
      variant="minimal"
    />
  );
}

// 4. Workstation Laptops
export function WorkstationLaptopSlider() {
  const primary = useProducts({ categorySlugs: ['workstation-pc'], limit: 20 });
  const fallback = useProducts({ categorySlugs: ['engineering-laptop', 'programming-laptop'], limit: 20 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="ورک‌استیشن‌های پردازشی"
      subtitle="مخصوص رندرینگ، برنامه‌نویسی و کارهای سنگین"
      viewAllLink="/products/category/engineering-laptop"
      products={items}
      isLoading={isLoading}
      variant="premium"
    />
  );
}

// 5. Ultrabooks
export function UltrabookSlider() {
  const primary = useProducts({ categorySlugs: ['ultrabook', 'convertible-laptop'], limit: 20 });
  const fallback = useProducts({ categorySlugs: ['laptop'], search: 'touch', limit: 20 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="اولترابوک‌های سبک و باریک"
      subtitle="همیشه همراه شما با شارژدهی فوق‌العاده"
      viewAllLink="/products/category/ultrabook"
      products={items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 6. Tablets
export function TabletSlider() {
  const primary = useProducts({ categorySlugs: ['convertible-laptop'], limit: 20 });
  const fallback = useProducts({ search: 'x360', limit: 20 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="تبلت‌ها و کتاب‌خوان‌ها"
      subtitle="برای مطالعه، طراحی و سرگرمی"
      viewAllLink="/products/category/convertible-laptop"
      products={items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 7. Gaming Consoles
export function ConsoleSlider() {
  const primary = useProducts({ categorySlugs: ['gaming-console'], limit: 20 });
  const fallback = useProducts({ categorySlugs: ['playstation', 'xbox', 'nintendo'], limit: 20 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="کنسول‌های بازی"
      subtitle="تجربه گیمینگ نسل جدید"
      viewAllLink="/products/category/gaming-console"
      products={items}
      isLoading={isLoading}
      variant="flash"
    />
  );
}

// 8. Monitors
export function MonitorSlider() {
  const primary = useProducts({ search: 'مانیتور', limit: 10 });
  const fallback = useProducts({ search: 'monitor', limit: 10 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="مانیتورها"
      subtitle="نمایشگرهای با کیفیت برای کار و بازی"
      viewAllLink="/products/category/monitor"
      products={items}
      isLoading={isLoading}
      variant="default"
    />
  );
}

// 9. PC Cases
export function CaseSlider() {
  const primary = useProducts({ categorySlugs: ['pc-case'], limit: 20 });
  const fallback = useProducts({ categorySlugs: ['gaming-pc', 'office-pc', 'workstation-pc'], limit: 20 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="کیس‌های کامپیوتر"
      subtitle="طراحی زیبا و خنک‌کاری عالی"
      viewAllLink="/products/category/pc-case"
      products={items}
      isLoading={isLoading}
      variant="minimal"
    />
  );
}

// 10. Printers
export function PrinterSlider() {
  const primary = useProducts({ search: 'پرینتر', limit: 10 });
  const fallback = useProducts({ search: 'printer', limit: 10 });
  const items = pickItems(primary.data?.items, fallback.data?.items);
  const isLoading = primary.isLoading || fallback.isLoading;
  const hasError = primary.isError && fallback.isError;

  if (shouldHideSlider({ isLoading, hasError, items })) {
    return null;
  }

  return (
    <ProductSlider
      title="پرینترها و اسکنرها"
      subtitle="برای نیازهای اداری و خانگی"
      viewAllLink="/products/category/printer"
      products={items}
      isLoading={isLoading}
      variant="default"
    />
  );
}
