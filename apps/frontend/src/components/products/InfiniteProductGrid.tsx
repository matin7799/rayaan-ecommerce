'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductCard } from '@/components/products/ProductCard';
import { useInfiniteProducts } from '@/lib/hooks/queries/useInfiniteProducts';
import { Loader2, PackageOpen } from 'lucide-react';
import type { ProductListItem } from '@/services';

interface InfiniteProductGridProps {
  initialCategoryId?: string;
}

function ProductSkeleton() {
  return (
    <div className="w-full h-[400px] rounded-3xl bg-zinc-100/80 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-700/50" />
  );
}

function mapProduct(product: ProductListItem) {
  const firstVariant = product.variants?.[0];
  const firstImage = product.images?.[0];
  const firstGallery = product.media?.gallery?.[0];
  const mediaThumbnail = product.media?.thumbnail;
  const firstCategory = product.categories?.[0];
  const stock = firstVariant?.inventory?.stock ?? firstVariant?.stock ?? 0;

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: firstCategory?.name || '',
    thumbnail:
      firstImage?.url ||
      mediaThumbnail?.url ||
      firstGallery?.url ||
      product.thumbnailUrl ||
      'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png',
    thumbnailAlt: firstImage?.alt || mediaThumbnail?.alt || product.title,
    price: firstVariant?.price || 0,
    discountPrice: firstVariant?.comparePrice || undefined,
    rating: 4.5,
    reviewsCount: 0,
    isNew: product.isActive,
    shortDescription: product.description || '',
    inStock: stock > 0,
    defaultVariantId: firstVariant?.id,
    hasMultipleVariants: (product.variants?.length || 0) > 1,
  };
}

export function InfiniteProductGrid({ initialCategoryId }: InfiniteProductGridProps) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProducts(initialCategoryId ? { categoryId: initialCategoryId } : {});

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800">
        <PackageOpen className="w-16 h-16 text-red-300 dark:text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
          خطا در بارگذاری محصولات
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          لطفاً دوباره تلاش کنید
        </p>
      </div>
    );
  }

  const allProducts = data?.pages.flatMap((page) => page.items) || [];

  if (allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800">
        <PackageOpen className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
          محصولی یافت نشد
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          لطفاً فیلترهای خود را تغییر دهید
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={mapProduct(product)} variant="default" />
        ))}
      </div>

      <div ref={ref} className="w-full py-8 flex items-center justify-center">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              در حال بارگذاری...
            </span>
          </div>
        ) : hasNextPage ? (
          <div className="h-4" />
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            پایان لیست محصولات
          </p>
        )}
      </div>
    </div>
  );
}
