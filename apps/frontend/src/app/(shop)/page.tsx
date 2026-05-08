import { DynamicBanner } from '@/components/shop/DynamicBanner';
import { BannersGrid } from '@/components/shop/BannersGrid';
import { BannerPosition } from '@/services/banner.service';
import {
  MobilePhonesSlider,
  GamingLaptopSlider,
  BudgetLaptopSlider,
  WorkstationLaptopSlider,
  UltrabookSlider,
  TabletSlider,
  ConsoleSlider,
  PrinterSlider,
  CaseSlider,
  MonitorSlider,
} from '@/components/home/HomeSliders';
import { CategoriesRow } from '@/components/home/categories-row';
import { StoreFeatures } from '@/components/home/store-features';
import { HeroSection } from '@/components/home/HeroSection';

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      
      <div className="flex flex-col gap-10 pb-10">
        <StoreFeatures />

        {/* 3. Main Categories */}
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

        {/* بخش دوم: لپ‌تاپ‌های اقتصادی و ورک‌استیشن */}
        <BudgetLaptopSlider />
        <WorkstationLaptopSlider />

        {/* بنرهای دوتایی برای تنوع بصری */}
        <section className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <BannersGrid
            position={BannerPosition.HOME_SECONDARY}
            variant="neon"
            size="md"
            limit={2}
          />
        </section>

        {/* بخش سوم: تبلت‌ها و آلترابوک‌ها */}
        <UltrabookSlider />
        <TabletSlider />

        {/* بخش چهارم: لوازم جانبی و اداری */}
        <ConsoleSlider />
        <MonitorSlider />
        <CaseSlider />
        <PrinterSlider />
      </div>
    </>
  );
}
