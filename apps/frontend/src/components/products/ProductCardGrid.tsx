'use client';

import { formatPersianPrice } from '@/lib/utils/price';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Check, Loader2, Heart, Eye, Cpu, Zap, Flame, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MouseEvent } from 'react';
import { ProductCardItem } from '@/types/catalog.types';

export interface ProductCardGridProps {
  product: ProductCardItem;
  variant: string;
  priority?: boolean;
  className?: string;
  isProductNavigating: boolean;
  isAddingToCart: boolean;
  cartStatus: 'idle' | 'loading' | 'success';
  handleAddToCart: (e: MouseEvent<HTMLButtonElement>) => void;
  handleToggleFavorite: (e: MouseEvent<HTMLButtonElement>) => void;
  isLiked: boolean;
  setIsQuickViewOpen: (open: boolean) => void;
  resolvedThumbnail: string;
  resolvedInStock: boolean;
  isUnavailable: boolean;
  animationDelay: string;
  handleProductLinkClick: () => void;
  imageWrapperClass: string;
  productImageClass: string;
  theme: { bg: string; shadow: string; text: string; icon: string };
  isCompact: boolean;
  cardVariantsClass: string;
}

export function ProductCardGrid({
  product,
  variant,
  priority = false,
  className,
  isProductNavigating,
  isAddingToCart,
  cartStatus,
  handleAddToCart,
  handleToggleFavorite,
  isLiked,
  setIsQuickViewOpen,
  resolvedThumbnail,
  resolvedInStock,
  isUnavailable,
  animationDelay,
  handleProductLinkClick,
  imageWrapperClass,
  productImageClass,
  theme,
  isCompact,
  cardVariantsClass,
}: ProductCardGridProps) {
  return (
    <div
      className={cn(cardVariantsClass, className)}
      style={{ animationDelay, animationFillMode: 'both' }}
    >
      <div className={imageWrapperClass}>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex flex-col gap-1.5 sm:gap-2 items-end">
          {variant === 'flash' && (
            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-md shadow-sm bg-rose-500 text-white animate-pulse">
              <Flame className="w-3 h-3" /> پیشنهاد ویژه
            </span>
          )}

          {product.isBestSeller && variant !== 'flash' && (
            <span className="px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-md shadow-sm bg-rose-500 text-white">
              پرفروش‌ترین
            </span>
          )}

          {product.isNew && (
            <span className="px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-md shadow-sm bg-emerald-500 text-white">
              جدید
            </span>
          )}

          {isUnavailable && (
            <span className="px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-md shadow-sm bg-rose-500 text-white">
              ناموجود
            </span>
          )}

          {product.badge && (
            <span className="px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded-md shadow-sm bg-indigo-500 text-white">
              {product.badge}
            </span>
          )}
        </div>

        <Image
          src={resolvedThumbnail}
          alt={product.thumbnailAlt || product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 768px) 46vw, (max-width: 1200px) 33vw, 25vw"
          className={productImageClass}
        />

        {isProductNavigating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-zinc-950/60 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-col gap-2 opacity-100 translate-x-0 sm:opacity-0 sm:-translate-x-4 sm:group-hover/card:opacity-100 sm:group-hover/card:translate-x-0 transition-all duration-300">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="group/btn w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all active:scale-75 hover:bg-rose-50 dark:hover:bg-rose-900/20 touch-manipulation"
            aria-label="Add to favorites"
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-all duration-300',
                isLiked
                  ? 'fill-rose-500 text-rose-500 scale-110'
                  : 'text-zinc-600 dark:text-zinc-300 group-hover/btn:text-rose-500'
              )}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsQuickViewOpen(true);
            }}
            className="group/btn w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all active:scale-75 hover:bg-zinc-100 dark:hover:bg-zinc-700 touch-manipulation"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-300 transition-colors group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 mt-3 sm:mt-4 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className={cn(
              'text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold truncate',
              variant === 'neon' ? 'text-cyan-500/70' : 'text-zinc-400'
            )}
          >
            {product.brand}
          </span>

          <div className="flex items-center gap-0.5 text-[10px] text-zinc-500 shrink-0">
            <Star
              className={cn(
                'w-3 h-3 fill-current',
                variant === 'premium' ? 'text-amber-500' : 'text-zinc-400'
              )}
            />

            <span className={variant === 'neon' ? 'text-slate-400' : ''}>
              {product.rating ?? 0}
            </span>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          onClick={handleProductLinkClick}
          className={cn(
            'font-medium transition-colors mb-2 min-h-[34px] sm:min-h-[40px]',
            variant === 'neon'
              ? 'text-slate-200 hover:text-cyan-400'
              : 'text-zinc-800 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300',
            isCompact ? 'text-xs line-clamp-2 sm:line-clamp-1' : 'text-xs sm:text-sm line-clamp-2'
          )}
        >
          {product.title}
        </Link>

        {!isCompact && product.specs && product.specs.length > 0 && (
          <div
            className={cn(
              'hidden sm:flex items-center gap-3 mt-auto mb-3 text-xs',
              variant === 'neon' ? 'text-slate-400' : 'text-zinc-500 dark:text-zinc-400'
            )}
          >
            {product.specs.slice(0, 2).map((spec, i) => (
              <div key={`${spec.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
                {i === 0 ? (
                  <Cpu className={cn('w-3.5 h-3.5 shrink-0', theme.icon)} />
                ) : (
                  <Zap className={cn('w-3.5 h-3.5 shrink-0', theme.icon)} />
                )}

                <span className="truncate max-w-[80px]">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            'flex items-end justify-between gap-2 mt-auto pt-2 border-t',
            variant === 'neon' ? 'border-slate-800' : 'border-zinc-100 dark:border-zinc-800/50'
          )}
        >
          <div className="flex flex-col min-w-0">
            {product.discountPrice ? (
              <>
                <span
                  className={cn(
                    'text-[10px] sm:text-xs line-through mb-0.5 truncate',
                    variant === 'flash' ? 'text-rose-300 dark:text-rose-700' : 'text-zinc-400'
                  )}
                >
                  {formatPersianPrice(product.price)}
                </span>

                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span
                    className={cn(
                      'text-xs sm:text-sm font-bold truncate',
                      variant === 'neon'
                        ? 'text-cyan-400'
                        : variant === 'flash'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-zinc-900 dark:text-white'
                    )}
                  >
                    {formatPersianPrice(product.discountPrice)}
                  </span>

                  <span className="text-[9px] sm:text-[10px] text-zinc-500 shrink-0">
                    تومان
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span
                  className={cn(
                    'text-xs sm:text-sm font-bold truncate',
                    variant === 'neon' ? 'text-slate-200' : 'text-zinc-900 dark:text-white'
                  )}
                >
                  {formatPersianPrice(product.price)}
                </span>

                <span className="text-[9px] sm:text-[10px] text-zinc-500 shrink-0">تومان</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingToCart || !resolvedInStock}
            aria-label="Add to cart"
            className={cn(
              'relative flex items-center justify-end h-9 rounded-xl overflow-hidden transition-all duration-300 ease-out shrink-0 touch-manipulation',
              'w-10 sm:w-9 sm:group-hover/card:w-32 active:scale-95',
              !resolvedInStock
                ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed sm:group-hover/card:w-9'
                : isAddingToCart
                  ? 'bg-green-500 !w-10 sm:!w-32 cursor-not-allowed text-white'
                  : theme.bg,
              !isAddingToCart && resolvedInStock && theme.shadow
            )}
          >
            <div className="absolute right-0 flex items-center justify-center w-10 sm:w-9 h-full shrink-0 z-10 transition-transform">
              {cartStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : cartStatus === 'success' ? (
                <Check className="w-4 h-4 text-white animate-in zoom-in" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </div>

            <span
              className={cn(
                'hidden sm:inline whitespace-nowrap text-xs font-medium pr-8 pl-3 opacity-0 translate-x-4 rtl:-translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300 delay-75',
                isAddingToCart && 'text-white',
                !resolvedInStock && 'text-zinc-500'
              )}
            >
              {!resolvedInStock
                ? 'ناموجود'
                : cartStatus === 'loading'
                  ? 'در حال افزودن...'
                  : cartStatus === 'success'
                    ? 'اضافه شد'
                    : 'افزودن به سبد'}
            </span>
          </button>
        </div>
        {isUnavailable && (
          <div className="mt-2 flex justify-start">
            <span className="inline-flex rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
              ناموجود
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
