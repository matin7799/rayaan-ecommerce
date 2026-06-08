'use client';

import { formatPersianPrice } from '@/lib/utils/price';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MouseEvent } from 'react';
import { ProductCardItem } from '@/types/catalog.types';

export interface ProductCardHorizontalProps {
  product: ProductCardItem;
  priority?: boolean;
  className?: string;
  isProductNavigating: boolean;
  isAddingToCart: boolean;
  cartStatus: 'idle' | 'loading' | 'success';
  handleAddToCart: (e: MouseEvent<HTMLButtonElement>) => void;
  resolvedThumbnail: string;
  resolvedInStock: boolean;
  animationDelay: string;
  handleProductLinkClick: () => void;
  theme: { bg: string; shadow: string; text: string; icon: string };
}

export function ProductCardHorizontal({
  product,
  priority = false,
  className,
  isProductNavigating,
  isAddingToCart,
  cartStatus,
  handleAddToCart,
  resolvedThumbnail,
  resolvedInStock,
  animationDelay,
  handleProductLinkClick,
  theme,
}: ProductCardHorizontalProps) {
  return (
    <div
      className={cn(
        'group/card relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 flex-row p-2.5 sm:p-3 gap-3 sm:gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-xl',
        className
      )}
      style={{ animationDelay, animationFillMode: 'both' }}
    >
      <div className="relative w-[38%] max-w-[150px] min-w-[108px] aspect-square bg-zinc-50 dark:bg-black/20 rounded-xl overflow-hidden shrink-0">
        {isProductNavigating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-zinc-950/60 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}

        <Image
          src={resolvedThumbnail}
          alt={product.thumbnailAlt || product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 38vw, (max-width: 768px) 30vw, 20vw"
          className="object-contain p-2 sm:p-3 mix-blend-multiply dark:mix-blend-normal group-hover/card:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col flex-1 justify-between py-1 min-w-0">
        <div className="min-w-0">
          <Link
            href={`/products/${product.slug}`}
            onClick={handleProductLinkClick}
            className="line-clamp-2 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-100 group-hover/card:text-indigo-600 transition-colors"
          >
            {product.title}
          </Link>

          <div className="flex items-center gap-1 mt-1 text-[11px] sm:text-xs text-amber-500">
            <Star className="w-3 h-3 fill-amber-500" />
            <span>{product.rating ?? 0}</span>
            <span className="text-zinc-400">({product.reviewsCount ?? 0})</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 mt-3 sm:mt-4">
          <div className="flex flex-col min-w-0">
            {product.discountPrice && (
              <span className="text-[11px] sm:text-xs text-zinc-400 line-through">
                {formatPersianPrice(product.price)} تومان
              </span>
            )}

            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
              {formatPersianPrice(product.discountPrice || product.price)} تومان
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingToCart || !resolvedInStock}
            aria-label="Add to cart"
            className={cn(
              'w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shrink-0 touch-manipulation',
              !resolvedInStock
                ? 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-white'
                : isAddingToCart
                  ? 'bg-green-500 cursor-not-allowed text-white'
                  : theme.bg
            )}
          >
            {cartStatus === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cartStatus === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
