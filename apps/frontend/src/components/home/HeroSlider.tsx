// app/(shop)/_components/HeroSlider.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Zap, TrendingUp } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'جشنواره فروش پاییزه',
    subtitle: 'تا ۵۰٪ تخفیف برای لپ‌تاپ‌های گیمینگ',
    badge: 'فروش ویژه',
    icon: Zap,
    image: 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/banners/banner1.png',
    gradient: 'from-violet-600/95 via-purple-700/90 to-slate-900/95',
    accentColor: 'bg-gradient-to-r from-violet-500 to-purple-600',
    glowColor: 'shadow-violet-500/50',
  },
  {
    id: 2,
    title: 'رونمایی از آیفون ۱۶',
    subtitle: 'هم‌اکنون با گارانتی ۱۸ ماهه شرکتی',
    badge: 'جدید',
    icon: TrendingUp,
    image: 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/banners/banner1.png',
    gradient: 'from-slate-700/95 via-slate-800/90 to-black/95',
    accentColor: 'bg-gradient-to-r from-slate-500 to-slate-700',
    glowColor: 'shadow-slate-500/50',
  },
  {
    id: 3,
    title: 'هدفون‌های بی‌سیم پریمیوم',
    subtitle: 'تجربه صدای استودیویی با ۴۰٪ تخفیف',
    badge: 'پیشنهاد ویژه',
    icon: Sparkles,
    image: 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/banners/banner1.png',
    gradient: 'from-emerald-600/95 via-teal-700/90 to-slate-900/95',
    accentColor: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    glowColor: 'shadow-emerald-500/50',
  },
];

export function HeroSlider() {
  const [plugin] = React.useState(() =>
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [api, setApi] = React.useState<any>(null);

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <Carousel
      opts={{ loop: true, direction: 'rtl', align: 'start' }}
      plugins={[plugin]}
      className="w-full h-[400px] rounded-xl overflow-hidden lg:rounded-2xl  group shadow-2xl"
      setApi={setApi}
    >
      <CarouselContent className="h-full ml-0">
        {SLIDES.map((slide, index) => {
          const IconComponent = slide.icon;
          return (
            <CarouselItem key={slide.id} className="h-full pl-0">
              <div className="relative h-[400px] w-full overflow-hidden">
                {/* Background Image with Ken Burns Effect */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-8000 ease-out group-hover:scale-110"
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                  />
                </div>
                
                {/* Multi-layer Gradient Overlays */}
                <div className={`absolute inset-0 z-10 bg-gradient-to-l ${slide.gradient}`} />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-transparent via-transparent to-black/40" />

                {/* Animated Glow Effects */}
                <div className="absolute inset-0 z-10 opacity-30">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px] animate-pulse delay-1000" />
                </div>

                {/* Content Container - Positioned absolutely to fill space */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-5 sm:px-8 lg:px-10 xl:px-12">
                  <div className="max-w-xl lg:max-w-2xl space-y-2 sm:space-y-2.5 lg:space-y-3">
                    {/* Badge with Icon */}
                    <div className="animate-fade-in-up">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full ${slide.accentColor} text-white text-xs sm:text-sm font-bold backdrop-blur-md ${slide.glowColor} shadow-xl border border-white/20`}>
                        <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                        {slide.badge}
                      </span>
                    </div>

                    {/* Title with Stagger Animation */}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black leading-tight text-white drop-shadow-2xl animate-fade-in-up animation-delay-100">
                      {slide.title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base lg:text-lg text-white/95 font-semibold drop-shadow-lg animate-fade-in-up animation-delay-200 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    {/* CTA Button */}
                    <div className="pt-1 sm:pt-2 animate-fade-in-up animation-delay-300">
                      <Button 
                        size="lg" 
                        className="rounded-full bg-white text-slate-900 hover:bg-white/95 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl font-bold text-xs sm:text-sm lg:text-base px-4 sm:px-6 lg:px-7 py-3 sm:py-4 lg:py-5 group/btn border-2 border-white/50"
                      >
                        <span className="relative z-10">مشاهده و خرید</span>
                        <ArrowLeft className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-br-full blur-2xl z-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full blur-2xl z-10" />
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      {/* Navigation Arrows - Desktop Only */}
      <div className="hidden lg:block">
        <CarouselPrevious className="absolute right-4 xl:right-6 rotate-180 left-auto top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white border-white/20 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 w-10 h-10 xl:w-12 xl:h-12 shadow-2xl hover:scale-110 active:scale-95" />
        <CarouselNext className="hidden lg:flex absolute left-4 xl:left-6 rotate-180 right-auto top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white border-white/20 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 w-10 h-10 xl:w-12 xl:h-12 shadow-2xl hover:scale-110 active:scale-95" />
      </div>

      {/* Interactive Pagination Dots */}
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? 'w-8 sm:w-10 bg-white shadow-lg shadow-white/50' 
                : 'w-1.5 bg-white/40 hover:bg-white/70 hover:w-4'
            }`}
            aria-label={`برو به اسلاید ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div 
          className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-300"
          style={{ 
            width: `${((currentSlide + 1) / SLIDES.length) * 100}%` 
          }}
        />
      </div>
    </Carousel>
  );
}
