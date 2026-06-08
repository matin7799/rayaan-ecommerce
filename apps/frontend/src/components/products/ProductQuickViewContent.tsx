'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  ArrowUpLeft,
  Cpu,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductCardItem } from '@/types/catalog.types';
import { cn } from '@/lib/utils';

export interface ProductQuickViewContentProps {
  productData: ProductCardItem;
  currentImageIndex: number;
  setCurrentImageIndex: (idx: number) => void;
  images: string[];
  handlePrevImage: () => void;
  handleNextImage: () => void;
  safeDiscountPrice: number | undefined;
  safePrice: number;
  handleAddToCart: () => Promise<void>;
  cartStatus: 'idle' | 'loading' | 'success';
}

export function ProductQuickViewContent({
  productData,
  currentImageIndex,
  setCurrentImageIndex,
  images,
  handlePrevImage,
  handleNextImage,
  safeDiscountPrice,
  safePrice,
  handleAddToCart,
  cartStatus,
}: ProductQuickViewContentProps) {
  return (
    <div className="flex flex-col md:flex-row w-full h-[85vh] md:h-[650px] max-h-[90vh]">
      {/* بخش اسلایدر تصویر */}
      <div className="relative w-full h-[40vh] md:w-1/2 md:h-full shrink-0 group bg-zinc-50 dark:bg-zinc-900/40 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-purple-500/5 dark:from-teal-500/10 dark:to-purple-500/10 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative w-full flex-grow flex items-center justify-center min-h-[200px] md:min-h-[250px]">
          <Image
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={`${productData.title} - تصویر ${currentImageIndex + 1}`}
            fill
            className="object-contain p-4 md:p-8 drop-shadow-2xl animate-in fade-in zoom-in-95 duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 hover:text-teal-600 transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 hover:text-teal-600 transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="flex items-center gap-2 mt-2 md:mt-4 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    'transition-all duration-300 rounded-full',
                    currentImageIndex === idx
                      ? 'w-6 h-2 bg-teal-600 dark:bg-teal-500'
                      : 'w-2 h-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {safeDiscountPrice && safePrice > safeDiscountPrice && (
          <div className="absolute top-4 right-4 lg:top-8 lg:right-8 bg-rose-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-rose-500/30 flex items-center gap-1.5 z-10">
            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-white" />
            {Math.round(((safePrice - safeDiscountPrice) / safePrice) * 100)}% تخفیف
          </div>
        )}
      </div>

      {/* بخش اطلاعات و مشخصات */}
      <div className="w-full h-[45vh] md:w-1/2 md:h-full flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto custom-scrollbar relative">
        <div className="flex flex-col flex-grow p-5 md:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs md:text-sm font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-900 px-3 py-1 md:px-4 md:py-1.5 rounded-full">
              {productData.brand}
            </span>
            <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
              <span className="text-xs md:text-sm font-bold">{productData.rating}</span>
              <span className="text-[10px] md:text-xs font-medium text-amber-600/70 dark:text-amber-500/70">
                ({productData.reviewsCount} نظر)
              </span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white mb-3 leading-snug">
            {productData.title}
          </h2>

          <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {productData.shortDescription ||
              'توضیحات کوتاهی برای این محصول ثبت نشده است. این محصول با ضمانت اصالت کالا و بهترین کیفیت به دست شما می‌رسد.'}
          </p>

          {productData.specs && productData.specs.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs md:text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-500" /> مشخصات کلیدی
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {productData.specs.slice(0, 6).map((spec, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-2.5 md:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 hover:border-teal-100 dark:hover:border-teal-900/50 transition-colors"
                  >
                    <span className="text-[10px] md:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      {spec.label}
                    </span>
                    <span
                      className="text-xs md:text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate"
                      title={spec.value}
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-5 md:pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4 md:gap-5 pb-4 md:pb-0">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1">
                {safeDiscountPrice && safePrice > safeDiscountPrice ? (
                  <>
                    <span className="text-xs md:text-sm font-medium text-zinc-400 line-through decoration-rose-500/50">
                      {safePrice.toLocaleString('fa-IR')}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-500">
                        {safeDiscountPrice.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold text-zinc-500">
                        تومان
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">
                      {safePrice.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-zinc-500">
                      تومان
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={cartStatus !== 'idle'}
                className={cn(
                  'w-full sm:flex-1 h-12 text-xs md:text-sm font-bold rounded-xl shadow-lg transition-all',
                  cartStatus === 'idle' &&
                    'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 hover:-translate-y-0.5',
                  cartStatus === 'loading' && 'bg-teal-600/80 text-white cursor-not-allowed',
                  cartStatus === 'success' && 'bg-emerald-500 text-white shadow-emerald-500/20',
                )}
              >
                {cartStatus === 'idle' && (
                  <>
                    <ShoppingCart className="w-4 h-4 ml-2" />
                    افزودن به سبد
                  </>
                )}
                {cartStatus === 'loading' && (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    در حال افزودن...
                  </>
                )}
                {cartStatus === 'success' && (
                  <>
                    <Check className="w-4 h-4 ml-2" />
                    اضافه شد
                  </>
                )}
              </Button>
              <Link
                href={`/products/${productData.slug}`}
                className="flex items-center justify-center w-full px-6"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-xs md:text-sm"
                >
                  مشاهده کامل
                  <ArrowUpLeft className="w-4 h-4 mr-2 opacity-50" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-6 mt-1 text-[10px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 md:gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" /> ضمانت ۷
                روزه
              </span>
              <span className="flex items-center gap-1 md:gap-1.5">
                <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> ارسال اکسپرس
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
