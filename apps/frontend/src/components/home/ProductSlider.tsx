'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Flame, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/products/ProductCard';
import type { ProductListItem } from '@/services';

type SliderVariant = 'default' | 'premium' | 'flash' | 'minimal';

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  products?: ProductListItem[];
  variant?: SliderVariant;
  className?: string;
  isLoading?: boolean;
}

// Map backend product to ProductCard format
function mapProduct(product: ProductListItem) {
  const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';
  const firstVariant = product.variants?.[0];
  const firstImage = product.images?.[0]?.url?.trim();
  const firstGallery = product.media?.gallery?.[0]?.url?.trim();
  const mediaThumbnail = product.media?.thumbnail?.url?.trim();
  const thumbnail = product.thumbnailUrl?.trim();
  const stock =
    firstVariant?.inventory?.stock ??
    firstVariant?.stock ??
    product.stockQuantity ??
    0;
  const basePrice = product.pricing?.basePrice ?? firstVariant?.comparePrice ?? firstVariant?.price ?? 0;
  const finalPrice = product.pricing?.finalPrice ?? firstVariant?.price ?? basePrice;
  const discountPrice = finalPrice < basePrice ? finalPrice : undefined;
  
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand?.name || product.categories?.[0]?.name || '',
    thumbnail: firstImage || mediaThumbnail || firstGallery || thumbnail || PLACEHOLDER_IMAGE,
    thumbnailAlt: product.title,
    price: basePrice,
    discountPrice,
    rating: product.rating ?? 4.5,
    reviewsCount: product.reviewsCount ?? 0,
    isNew: product.isActive,
    shortDescription: product.shortDescription || product.description || '',
    defaultVariantId: firstVariant?.id,
    hasMultipleVariants: (product.variants?.length || 0) > 1,
    inStock: stock > 0,
    specs: [],
  };
}

export function ProductSlider({
  title,
  subtitle,
  viewAllLink,
  products,
  variant = 'default',
  className,
  isLoading = false,
}: ProductSliderProps) {
  const variantStyles = {
    default: {
      container: 'bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950',
      header: 'text-zinc-900 dark:text-zinc-100',
      icon: Sparkles,
      iconColor: 'text-primary',
    },
    premium: {
      container: 'bg-gradient-to-br from-amber-50/50 to-white dark:from-zinc-900 dark:to-zinc-950',
      header: 'text-amber-900 dark:text-amber-100',
      icon: Zap,
      iconColor: 'text-amber-500',
    },
    flash: {
      container: 'bg-gradient-to-br from-rose-50/30 to-white dark:from-rose-950/20 dark:to-zinc-950',
      header: 'text-rose-900 dark:text-rose-100',
      icon: Flame,
      iconColor: 'text-rose-500',
    },
    minimal: {
      container: 'bg-zinc-50/50 dark:bg-zinc-900/30',
      header: 'text-zinc-900 dark:text-zinc-100',
      icon: Sparkles,
      iconColor: 'text-zinc-500',
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <section className={cn('relative py-8 px-4 md:px-8 rounded-3xl', style.container, className)}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 shadow-sm', style.iconColor)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className={cn('text-2xl md:text-3xl font-bold', style.header)}>{title}</h2>
              {subtitle && (
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {viewAllLink && !isLoading && (
            <Link
              href={viewAllLink}
              className="group flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span>مشاهده همه</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Products Carousel */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <Carousel
            opts={{
              align: 'start',
              direction: 'rtl',
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <ProductCard product={mapProduct(product)} variant={variant} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -right-4" />
            <CarouselNext className="hidden md:flex -left-4" />
          </Carousel>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </section>
  );
}
