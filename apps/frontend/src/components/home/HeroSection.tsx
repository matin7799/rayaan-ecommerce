// app/(shop)/_components/HeroSection.tsx
import { HeroSideBanners } from "./HeroSideBanners";
import { HeroSlider } from "./HeroSlider";

export function HeroSection() {
  return (
    <section className="relative w-full pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-4 lg:pb-6 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-480 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 items-stretch">
          {/* Main Slider */}
          <div className="lg:col-span-8">
            <div className="relative min-h-65 sm:min-h-80 lg:min-h-100 xl:min-h-112.5 h-full rounded-2xl sm:rounded-3xl overflow-hidden">
              <HeroSlider />
            </div>
          </div>

          {/* Side Banners */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="relative min-h-100 xl:min-h-112.5 h-full rounded-2xl sm:rounded-3xl overflow-hidden">
              <HeroSideBanners />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
