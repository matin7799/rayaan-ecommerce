// app/(shop)/_components/HeroSection.tsx
import { HeroSideBanners } from "./HeroSideBanners";
import { HeroSlider } from "./HeroSlider";

export function HeroSection() {
  return (
    <section className="w-full py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-[1920px] mx-auto">
          {/* Main Slider - 8 columns on desktop */}
          <div className="lg:col-span-8 h-[280px] sm:h-[350px] lg:h-[400px] xl:h-[450px]">
            <HeroSlider />
          </div>
          
          {/* Side Banners - 4 columns on desktop */}
          <div className="hidden lg:block lg:col-span-4 h-[400px] xl:h-[450px]">
            <HeroSideBanners />
          </div>
        </div>
      </div>
    </section>
  );
}
