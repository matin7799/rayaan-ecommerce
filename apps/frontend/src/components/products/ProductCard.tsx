// ProductCard.tsx

'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ProductQuickView = dynamic(
  () => import('./ProductQuickView').then((mod) => mod.ProductQuickView),
  { ssr: false }
);
import { cartService } from '@/services/cart.service';
import { ProductCardItem } from '@/types/catalog.types';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { authService, userService } from '@/services';
import { getErrorMessage } from '@/lib/api/error-handler';
import { ProductCardHorizontal } from './ProductCardHorizontal';
import { ProductCardGrid } from './ProductCardGrid';

const cardVariants = cva(
  'group/card relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4',
  {
    variants: {
      variant: {
        default:
          'p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700',
        compact:
          'p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg',
        horizontal:
          'flex-row p-2.5 sm:p-3 gap-3 sm:gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-xl',
        gaming:
          'p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)]',
        workstation:
          'p-2.5 sm:p-3 bg-white dark:bg-stone-900 border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)]',
        neon:
          'p-2.5 sm:p-3 bg-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:border-cyan-400',
        premium:
          'p-2.5 sm:p-3 bg-gradient-to-br from-amber-50/50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400/60 hover:shadow-[0_10px_40px_rgb(251,191,36,0.15)]',
        flash:
          'p-2.5 sm:p-3 bg-rose-50/30 dark:bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/80 hover:shadow-[0_8px_30px_rgb(244,63,94,0.15)]',
        minimal:
          'p-2.5 sm:p-3 bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type VariantKey = NonNullable<VariantProps<typeof cardVariants>['variant']>;

const colorTokens: Record<VariantKey, { bg: string; shadow: string; text: string; icon: string }> =
  {
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
  const isUnavailable = product.isUnavailable ?? !resolvedInStock;
  const resolvedThumbnail =
    product.thumbnail && product.thumbnail.trim().length > 0
      ? product.thumbnail
      : 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';

  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isProductNavigating, setIsProductNavigating] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isLiked = useWishlistStore((state) => state.isInWishlist(product.id));

  const { accessToken, sessionChecked, setAuth, setTokens, logout, setSessionChecked } =
    useAuthStore();
  const isAddingToCart = cartStatus === 'loading';

  const imageWrapperClass = cn(
    'relative w-full overflow-hidden flex items-center justify-center rounded-xl transition-colors duration-300',
    isCompact
      ? 'aspect-square min-h-[150px] sm:min-h-[170px] md:min-h-[190px]'
      : 'aspect-[4/3] min-h-[190px] sm:min-h-[220px] md:min-h-[250px] lg:min-h-[270px]',
    variant === 'neon'
      ? 'bg-slate-900/50'
      : variant === 'premium'
        ? 'bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm'
        : variant === 'flash'
          ? 'bg-white/80 dark:bg-rose-950/30'
          : variant === 'minimal'
            ? 'bg-transparent'
            : 'bg-zinc-50 dark:bg-black/20'
  );

  const productImageClass = cn(
    'object-contain transition-all duration-700 ease-out group-hover/card:scale-110',
    'p-2 sm:p-4 md:p-5 lg:p-6',
    variant !== 'neon' && 'mix-blend-multiply dark:mix-blend-normal',
    variant === 'neon' && 'drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    variant === 'premium' && 'group-hover/card:-translate-y-2 group-hover/card:scale-105'
  );

  const resolveVariantId = () => {
    if (product.defaultVariantId) return product.defaultVariantId;
    if (product.hasMultipleVariants) return undefined;
    return product.id;
  };

  useEffect(() => {
    setIsProductNavigating(false);
  }, [pathname]);

  const handleProductLinkClick = () => {
    if (pathname !== `/products/${product.slug}`) {
      setIsProductNavigating(true);
    }
  };

  const ensureSession = async () => {
    if (accessToken) return true;
    if (!sessionChecked) return null;

    try {
      const refresh = await authService.refreshSession();
      const tokens = refresh.data;

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        return false;
      }

      setTokens(tokens.accessToken, tokens.refreshToken);

      const user = await userService.getProfile();

      setAuth(user, tokens.accessToken, tokens.refreshToken);
      setSessionChecked(true);

      return true;
    } catch {
      logout();
      return false;
    }
  };

  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!resolvedInStock) {
      toast.error('محصول موجود نیست');
      return;
    }

    const variantId = resolveVariantId();

    if (!variantId) {
      toast.info('لطفاً ابتدا واریانت مورد نظر را انتخاب کنید');
      router.push(`/products/${product.slug}`);
      return;
    }

    const hasSession = await ensureSession();

    if (hasSession === null) {
      toast.info('در حال بررسی نشست کاربری... لطفاً دوباره تلاش کنید');
      return;
    }

    setCartStatus('loading');

    try {
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

      setCartStatus('success');

      setTimeout(() => {
        setCartStatus('idle');
      }, 800);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes('رزرو')) {
        toast.warning(errorMessage, {
          description: 'این کالا فعلا توسط کاربر دیگری در حال پرداخت است.',
        });
      } else {
        toast.error(errorMessage || 'خطا در افزودن به سبد خرید');
      }
      setCartStatus('idle');
    }
  };

  const handleToggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const isNowFavorite = toggleWishlist({
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      thumbnail: resolvedThumbnail,
      thumbnailAlt: product.thumbnailAlt,
      price: product.price,
      discountPrice: product.discountPrice,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      inStock: resolvedInStock,
    });

    toast.success(
      isNowFavorite ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد',
    );
  };

  if (isHorizontal) {
    return (
      <ProductCardHorizontal
        product={product}
        priority={priority}
        className={className}
        isProductNavigating={isProductNavigating}
        isAddingToCart={isAddingToCart}
        cartStatus={cartStatus}
        handleAddToCart={handleAddToCart}
        resolvedThumbnail={resolvedThumbnail}
        resolvedInStock={resolvedInStock}
        animationDelay={animationDelay}
        handleProductLinkClick={handleProductLinkClick}
        theme={theme}
      />
    );
  }

  return (
    <>
      <ProductCardGrid
        product={product}
        variant={variant}
        priority={priority}
        className={className}
        isProductNavigating={isProductNavigating}
        isAddingToCart={isAddingToCart}
        cartStatus={cartStatus}
        handleAddToCart={handleAddToCart}
        handleToggleFavorite={handleToggleFavorite}
        isLiked={isLiked}
        setIsQuickViewOpen={setIsQuickViewOpen}
        resolvedThumbnail={resolvedThumbnail}
        resolvedInStock={resolvedInStock}
        isUnavailable={isUnavailable}
        animationDelay={animationDelay}
        handleProductLinkClick={handleProductLinkClick}
        imageWrapperClass={imageWrapperClass}
        productImageClass={productImageClass}
        theme={theme}
        isCompact={isCompact}
        cardVariantsClass={cn(cardVariants({ variant }), className)}
      />

      {isQuickViewOpen && (
        <ProductQuickView
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
}
