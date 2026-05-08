// ProductCard.tsx

'use client';

import { formatPersianPrice } from '@/lib/utils/price';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Zap, Cpu, Eye, Plus, Check, Star, Flame } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ProductQuickView } from './ProductQuickView';
import { cartService } from '@/services/cart.service';
import { ProductCardItem } from '@/types/catalog.types';


const cardVariants = cva(
  'group/card relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4',
  {
    variants: {
      variant: {
        default:
          'p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700',
        compact:
          'p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg',
        horizontal:
          'flex-row p-3 gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-xl',
        gaming:
          'p-3 bg-white dark:bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)]',
        workstation:
          'p-3 bg-white dark:bg-stone-900 border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)]',
        neon:
          'p-3 bg-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:border-cyan-400',
        premium:
          'p-3 bg-gradient-to-br from-amber-50/50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400/60 hover:shadow-[0_10px_40px_rgb(251,191,36,0.15)]',
        flash:
          'p-3 bg-rose-50/30 dark:bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/80 hover:shadow-[0_8px_30px_rgb(244,63,94,0.15)]',
        minimal:
          'p-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type VariantKey = NonNullable<VariantProps<typeof cardVariants>['variant']>;

const colorTokens: Record<
  VariantKey,
  { bg: string; shadow: string; text: string; icon: string }
> = {
  default: {
    bg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    shadow: 'hover:shadow-indigo-500/25',
    text: 'text-indigo-600',
    icon: 'text-indigo-500',
  },
  compact: {
    bg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    shadow: 'hover:shadow-indigo-500/25',
    text: 'text-indigo-600',
    icon: 'text-indigo-500',
  },
  horizontal: {
    bg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    shadow: 'hover:shadow-indigo-500/25',
    text: 'text-indigo-600',
    icon: 'text-indigo-500',
  },
  gaming: {
    bg: 'bg-violet-600 hover:bg-violet-700 text-white',
    shadow: 'hover:shadow-violet-500/25',
    text: 'text-violet-500',
    icon: 'text-violet-500',
  },
  workstation: {
    bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    shadow: 'hover:shadow-emerald-500/25',
    text: 'text-emerald-500',
    icon: 'text-emerald-500',
  },
  neon: {
    bg: 'bg-cyan-500 hover:bg-cyan-400 text-white',
    shadow: 'hover:shadow-cyan-500/40',
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
  },
  premium: {
    bg: 'bg-amber-500 hover:bg-amber-600 text-amber-950',
    shadow: 'hover:shadow-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'text-amber-500',
  },
  flash: {
    bg: 'bg-rose-500 hover:bg-rose-600 text-white',
    shadow: 'hover:shadow-rose-500/30',
    text: 'text-rose-600 dark:text-rose-400',
    icon: 'text-rose-500',
  },
  minimal: {
    bg: 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200',
    shadow: 'hover:shadow-xl',
    text: 'text-zinc-900 dark:text-white',
    icon: 'text-zinc-600',
  },
};

export interface ProductCardProps extends Omit<VariantProps<typeof cardVariants>, 'variant'> {
  variant?: VariantKey;
  product: ProductCardItem;
  index?: number;
  priority?: boolean;
  className?: string;
  inStock?: boolean;
}

export function ProductCard({
  product,
  variant = 'default',
  index = 0,
  priority = false,
  className,
  inStock,
}: ProductCardProps) {
  const isHorizontal = variant === 'horizontal';
  const isCompact = variant === 'compact';
  const animationDelay = `${index * 75}ms`;
  const theme = colorTokens[variant];
  const resolvedInStock = inStock ?? product.inStock ?? true;
  const resolvedThumbnail =
    product.thumbnail && product.thumbnail.trim().length > 0
      ? product.thumbnail
      : 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';

  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!resolvedInStock) {
      toast.error('محصول موجود نیست');
      return;
    }

    if (!product.defaultVariantId) {
      toast.info('لطفاً ابتدا واریانت مورد نظر را انتخاب کنید');
      router.push(`/products/${product.slug}`);
      return;
    }

    setIsAddingToCart(true);

    try {
      const variantId = product.defaultVariantId;

      await cartService.addToCart({
        variantId,
        quantity: 1,
      });

      queryClient.invalidateQueries({ queryKey: ['cart'] });

      toast.success('محصول به سبد خرید اضافه شد', {
        description: product.title,
        action: {
          label: 'مشاهده سبد',
          onClick: () => router.push('/cart'),
        },
      });

      setTimeout(() => {
        setIsAddingToCart(false);
      }, 800);
    } catch (error) {
      console.error('Add to cart failed:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'خطا در افزودن به سبد خرید';
      toast.error(errorMessage);
      setIsAddingToCart(false);
    }
  };

  if (isHorizontal) {
    return (
      <div
        className={cn(cardVariants({ variant: 'horizontal' }), className)}
        style={{ animationDelay, animationFillMode: 'both' }}
      >
        <div className="relative w-1/3 aspect-square bg-zinc-50 dark:bg-black/20 rounded-xl overflow-hidden shrink-0">
          <Image
            src={resolvedThumbnail}
            alt={product.thumbnailAlt || product.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 33vw, 20vw"
            className="object-contain p-2 mix-blend-multiply dark:mix-blend-normal group-hover/card:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col flex-1 justify-between py-1">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-100 group-hover/card:text-indigo-600 transition-colors"
            >
              {product.title}
            </Link>

            <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{product.rating ?? 0}</span>
              <span className="text-zinc-400">({product.reviewsCount ?? 0})</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div className="flex flex-col">
              {product.discountPrice && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPersianPrice(product.price)} تومان
                </span>
              )}
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                {formatPersianPrice(product.discountPrice || product.price)} تومان
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !resolvedInStock}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95',
                !resolvedInStock
                  ? 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed text-white'
                  : isAddingToCart
                    ? 'bg-green-500 cursor-not-allowed text-white'
                    : theme.bg
              )}
            >
              {isAddingToCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(cardVariants({ variant }), className)}
        style={{ animationDelay, animationFillMode: 'both' }}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden flex items-center justify-center rounded-xl transition-colors duration-300',
            isCompact ? 'aspect-square' : 'aspect-[4/3]',
            variant === 'neon'
              ? 'bg-slate-900/50'
              : variant === 'premium'
                ? 'bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm'
                : variant === 'flash'
                  ? 'bg-white/80 dark:bg-rose-950/30'
                  : variant === 'minimal'
                    ? 'bg-transparent'
                    : 'bg-zinc-50 dark:bg-black/20'
          )}
        >
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            {variant === 'flash' && (
              <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md shadow-sm bg-rose-500 text-white animate-pulse">
                <Flame className="w-3 h-3" /> پیشنهاد ویژه
              </span>
            )}

            {product.isBestSeller && variant !== 'flash' && (
              <span className="px-2 py-1 text-[10px] font-bold rounded-md shadow-sm bg-rose-500 text-white">
                پرفروش‌ترین
              </span>
            )}

            {product.isNew && (
              <span className="px-2 py-1 text-[10px] font-bold rounded-md shadow-sm bg-emerald-500 text-white">
                جدید
              </span>
            )}

            {product.badge && (
              <span className="px-2 py-1 text-[10px] font-bold rounded-md shadow-sm bg-indigo-500 text-white">
                {product.badge}
              </span>
            )}
          </div>

          <Image
            src={resolvedThumbnail}
            alt={product.thumbnailAlt || product.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={cn(
              'object-contain p-6 transition-all duration-700 ease-out group-hover/card:scale-110',
              variant !== 'neon' && 'mix-blend-multiply dark:mix-blend-normal',
              variant === 'neon' && 'drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]',
              variant === 'premium' && 'group-hover/card:-translate-y-2 group-hover/card:scale-105'
            )}
          />

          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 opacity-0 -translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="group/btn w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all active:scale-75 hover:bg-rose-50 dark:hover:bg-rose-900/20"
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
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="group/btn w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all active:scale-75 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-300 transition-colors group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white" />
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 mt-4">
          <div className="flex items-center justify-between mb-1">
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider font-semibold',
                variant === 'neon' ? 'text-cyan-500/70' : 'text-zinc-400'
              )}
            >
              {product.brand}
            </span>

            <div className="flex items-center gap-0.5 text-[10px] text-zinc-500">
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
            className={cn(
              'font-medium transition-colors mb-2',
              variant === 'neon'
                ? 'text-slate-200 hover:text-cyan-400'
                : 'text-zinc-800 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300',
              isCompact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
            )}
          >
            {product.title}
          </Link>

          {!isCompact && product.specs && product.specs.length > 0 && (
            <div
              className={cn(
                'flex items-center gap-3 mt-auto mb-3 text-xs',
                variant === 'neon' ? 'text-slate-400' : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              {product.specs.slice(0, 2).map((spec, i) => (
                <div key={`${spec.label}-${i}`} className="flex items-center gap-1.5">
                  {i === 0 ? (
                    <Cpu className={cn('w-3.5 h-3.5', theme.icon)} />
                  ) : (
                    <Zap className={cn('w-3.5 h-3.5', theme.icon)} />
                  )}
                  <span className="truncate max-w-[80px]">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          <div
            className={cn(
              'flex items-end justify-between mt-auto pt-2 border-t',
              variant === 'neon' ? 'border-slate-800' : 'border-zinc-100 dark:border-zinc-800/50'
            )}
          >
            <div className="flex flex-col">
              {product.discountPrice ? (
                <>
                  <span
                    className={cn(
                      'text-xs line-through mb-0.5',
                      variant === 'flash'
                        ? 'text-rose-300 dark:text-rose-700'
                        : 'text-zinc-400'
                    )}
                  >
                    {formatPersianPrice(product.price)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        variant === 'neon'
                          ? 'text-cyan-400'
                          : variant === 'flash'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-zinc-900 dark:text-white'
                      )}
                    >
                      {formatPersianPrice(product.discountPrice)}
                    </span>
                    <span className="text-[10px] text-zinc-500">تومان</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-sm font-bold',
                      variant === 'neon' ? 'text-slate-200' : 'text-zinc-900 dark:text-white'
                    )}
                  >
                    {formatPersianPrice(product.price)}
                  </span>
                  <span className="text-[10px] text-zinc-500">تومان</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !resolvedInStock}
              className={cn(
                'relative flex items-center justify-end h-9 rounded-xl overflow-hidden transition-all duration-300 ease-out',
                'w-9 group-hover/card:w-32 active:scale-95',
                !resolvedInStock
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed group-hover/card:w-9'
                  : isAddingToCart
                    ? 'bg-green-500 !w-32 cursor-not-allowed text-white'
                    : theme.bg,
                !isAddingToCart && resolvedInStock && theme.shadow
              )}
            >
              <div className="absolute right-0 flex items-center justify-center w-9 h-full shrink-0 z-10 transition-transform">
                {isAddingToCart ? (
                  <Check className="w-4 h-4 text-white animate-in zoom-in" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </div>

              <span
                className={cn(
                  'whitespace-nowrap text-xs font-medium pr-8 pl-3 opacity-0 translate-x-4 rtl:-translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300 delay-75',
                  isAddingToCart && 'text-white'
                )}
              >
                {isAddingToCart ? 'اضافه شد' : 'افزودن به سبد'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <ProductQuickView
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
