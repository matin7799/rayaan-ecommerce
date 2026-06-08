import { DynamicBanner } from '@/components/shop/DynamicBanner';
import { BannersGrid } from '@/components/shop/BannersGrid';
import { BannerPosition } from '@/services/banner.service';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoriesRow } from '@/components/home/categories-row';
import { StoreFeatures } from '@/components/home/store-features';
import { HeroSection } from '@/components/home/HeroSection';
import { DigipayBanner } from '@/components/home/DigipayBanner';

import {
  MobilePhonesSlider,
  GamingLaptopSlider,
} from '@/components/home/HomeSliders';

const SliderSkeleton = () => (
  <div className="container mx-auto px-4 py-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-40 w-full rounded-xl sm:h-48" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const BudgetLaptopSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.BudgetLaptopSlider), {
  loading: () => <SliderSkeleton />,
});
const WorkstationLaptopSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.WorkstationLaptopSlider), {
  loading: () => <SliderSkeleton />,
});
const UltrabookSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.UltrabookSlider), {
  loading: () => <SliderSkeleton />,
});
const TabletSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.TabletSlider), {
  loading: () => <SliderSkeleton />,
});
const ConsoleSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.ConsoleSlider), {
  loading: () => <SliderSkeleton />,
});
const MonitorSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.MonitorSlider), {
  loading: () => <SliderSkeleton />,
});
const CaseSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.CaseSlider), {
  loading: () => <SliderSkeleton />,
});
const PrinterSlider = dynamic(() => import('@/components/home/HomeSliders').then(mod => mod.PrinterSlider), {
  loading: () => <SliderSkeleton />,
});

export default async function HomePage() {
  return (
    <>
      <HeroSection/>

      <section className="relative z-10 flex flex-col gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-12">
        {/* فاصله امن از هیرو برای جلوگیری از overlap در موبایل */}
        <StoreFeatures />

        {/* Main Categories */}
        <CategoriesRow />

        {/* بخش اول: گوشی و لپ‌تاپ‌های گیمینگ */}
        <MobilePhonesSlider />
        <GamingLaptopSlider />

        {/* بنر بزرگ - پیشنهاد ویژه گیمینگ */}
        <section className="container mx-auto px-4 md:px-8">
          <DynamicBanner
            position={BannerPosition.HOME_HERO}
            variant="premium"
            size="lg"
            limit={1}
          />
        </section>

        {/* بنر تبلیغاتی اقساطی دیجی‌پی در سبک سایبر-مینیمال */}
        <section className="container mx-auto px-4 md:px-8">
          <DigipayBanner />
        </section>

        {/* بخش دوم: لپ‌تاپ‌های اقتصادی و ورک‌استیشن */}
        <BudgetLaptopSlider />
        <WorkstationLaptopSlider />

        {/* بنرهای دوتایی برای تنوع بصری */}
        <section className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <BannersGrid
              position={BannerPosition.HOME_SECONDARY}
              variant="neon"
              size="md"
              limit={2}
            />
          </div>
        </section>

        {/* بخش سوم: تبلت‌ها و آلترابوک‌ها */}
        <UltrabookSlider />
        <TabletSlider />

        {/* بخش چهارم: لوازم جانبی و اداری */}
        <ConsoleSlider />
        <MonitorSlider />
        <CaseSlider />
        <PrinterSlider />
      </section>
    </>
  );
}
