import type { ProductListItem } from '@/services';

export type ProductQueryInput = Record<string, any>;

export type SliderConfig = {
  key: string;
  title: string;
  mobileTitle?: string;
  subtitle: string;
  mobileSubtitle?: string;
  viewAllLink: string;
  variant: 'default' | 'flash' | 'minimal' | 'premium';
  primaryQuery: (limit: number) => ProductQueryInput;
  fallbackQuery?: (limit: number) => ProductQueryInput;
  filter?: (product: ProductListItem) => boolean;
  slice?: number;
};

export function normalizeText(value?: string): string {
  return (value ?? '').toLowerCase().trim();
}

export function isGamingLaptop(product: ProductListItem): boolean {
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

  const isLaptopCategory = (product.categories ?? []).some((category) => {
    const categoryText = normalizeText(`${category.name} ${category.slug}`);

    return (
      categoryText.includes('laptop') ||
      categoryText.includes('notebook') ||
      categoryText.includes('لپ') ||
      categoryText.includes('نوت بوک')
    );
  });

  const isGaming = /gaming|gamer|rtx|geforce|گیم|گیمینگ/.test(text);

  return isLaptopCategory && isGaming;
}

export const sliderConfigs: Record<string, SliderConfig> = {
  mobilePhones: {
    key: 'mobilePhones',
    title: 'جدیدترین گوشی‌های موبایل',
    mobileTitle: 'گوشی‌های موبایل',
    subtitle: 'به‌روزترین اسمارت‌فون‌های بازار با بهترین قیمت',
    mobileSubtitle: 'مدل‌های جدید با بهترین قیمت',
    viewAllLink: '/products/category/mobile',
    variant: 'default',
    primaryQuery: (limit) => ({ search: 'گوشی', limit }),
    fallbackQuery: (limit) => ({ search: 'mobile', limit }),
  },

  gamingLaptops: {
    key: 'gamingLaptops',
    title: 'سیستم‌های گیمینگ',
    mobileTitle: 'لپ‌تاپ گیمینگ',
    subtitle: 'قدرت بی‌نهایت برای گیمرهای حرفه‌ای',
    mobileSubtitle: 'قدرت بالا برای بازی حرفه‌ای',
    viewAllLink: '/products/category/gaming-laptop',
    variant: 'flash',
    primaryQuery: (limit) => ({ categorySlugs: ['gaming-laptop'], limit }),
    fallbackQuery: (limit) => ({ categorySlugs: ['laptop'], search: 'gaming', limit }),
    filter: isGamingLaptop,
    slice: 10,
  },

  budgetLaptops: {
    key: 'budgetLaptops',
    title: 'لپ‌تاپ‌های اقتصادی',
    mobileTitle: 'لپ‌تاپ اقتصادی',
    subtitle: 'کارایی بالا، قیمت مناسب برای دانشجویان و دانش‌آموزان',
    mobileSubtitle: 'مناسب دانشجو و استفاده روزمره',
    viewAllLink: '/products/category/budget-laptop?maxPrice=30000000',
    variant: 'minimal',
    primaryQuery: (limit) => ({
      categorySlugs: ['budget-laptop'],
      maxPrice: 30000000,
      limit,
    }),
    fallbackQuery: (limit) => ({
      search: 'laptop',
      maxPrice: 30000000,
      limit,
    }),
  },

  workstationLaptops: {
    key: 'workstationLaptops',
    title: 'ورک‌استیشن‌های پردازشی',
    mobileTitle: 'ورک‌استیشن‌ها',
    subtitle: 'مخصوص رندرینگ، برنامه‌نویسی و کارهای سنگین',
    mobileSubtitle: 'برای برنامه‌نویسی و پردازش سنگین',
    viewAllLink: '/products/category/engineering-laptop',
    variant: 'premium',
    primaryQuery: (limit) => ({ categorySlugs: ['workstation-pc'], limit }),
    fallbackQuery: (limit) => ({
      categorySlugs: ['engineering-laptop', 'programming-laptop'],
      limit,
    }),
  },

  ultrabooks: {
    key: 'ultrabooks',
    title: 'اولترابوک‌های سبک و باریک',
    mobileTitle: 'اولترابوک‌ها',
    subtitle: 'همیشه همراه شما با شارژدهی فوق‌العاده',
    mobileSubtitle: 'سبک، باریک و مناسب حمل',
    viewAllLink: '/products/category/ultrabook',
    variant: 'default',
    primaryQuery: (limit) => ({ categorySlugs: ['ultrabook', 'convertible-laptop'], limit }),
    fallbackQuery: (limit) => ({ categorySlugs: ['laptop'], search: 'touch', limit }),
  },

  tablets: {
    key: 'tablets',
    title: 'تبلت‌ها و کتاب‌خوان‌ها',
    mobileTitle: 'تبلت‌ها',
    subtitle: 'برای مطالعه، طراحی و سرگرمی',
    mobileSubtitle: 'برای مطالعه و سرگرمی',
    viewAllLink: '/products/category/tablet',
    variant: 'default',
    primaryQuery: (limit) => ({ search: 'tablet', limit }),
    fallbackQuery: (limit) => ({ search: 'تبلت', limit }),
  },

  consoles: {
    key: 'consoles',
    title: 'کنسول‌های بازی',
    mobileTitle: 'کنسول بازی',
    subtitle: 'تجربه گیمینگ نسل جدید',
    mobileSubtitle: 'تجربه نسل جدید بازی',
    viewAllLink: '/products/category/gaming-console',
    variant: 'flash',
    primaryQuery: (limit) => ({ categorySlugs: ['gaming-console'], limit }),
    fallbackQuery: (limit) => ({ categorySlugs: ['playstation', 'xbox', 'nintendo'], limit }),
  },

  monitors: {
    key: 'monitors',
    title: 'مانیتورها',
    mobileTitle: 'مانیتورها',
    subtitle: 'نمایشگرهای با کیفیت برای کار و بازی',
    mobileSubtitle: 'برای کار و بازی',
    viewAllLink: '/products/category/monitor',
    variant: 'default',
    primaryQuery: (limit) => ({ search: 'مانیتور', limit }),
    fallbackQuery: (limit) => ({ search: 'monitor', limit }),
  },

  cases: {
    key: 'cases',
    title: 'کیس‌های کامپیوتر',
    mobileTitle: 'کیس کامپیوتر',
    subtitle: 'طراحی زیبا و خنک‌کاری عالی',
    mobileSubtitle: 'طراحی خوب با تهویه مناسب',
    viewAllLink: '/products/category/pc-case',
    variant: 'minimal',
    primaryQuery: (limit) => ({ categorySlugs: ['pc-case'], limit }),
    fallbackQuery: (limit) => ({ search: 'case', limit }),
  },

  printers: {
    key: 'printers',
    title: 'پرینترها و اسکنرها',
    mobileTitle: 'پرینترها',
    subtitle: 'برای نیازهای اداری و خانگی',
    mobileSubtitle: 'برای خانه و اداره',
    viewAllLink: '/products/category/printer',
    variant: 'default',
    primaryQuery: (limit) => ({ search: 'پرینتر', limit }),
    fallbackQuery: (limit) => ({ search: 'printer', limit }),
  },
};
