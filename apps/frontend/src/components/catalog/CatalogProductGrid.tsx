// CatalogProductGrid.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { ProductCard } from '@/components/products/ProductCard';
import { useInfiniteProductsQuery } from '@/hooks/catalog/useInfiniteProductsQuery';
import type { CatalogFilters } from '@/services/catalog.service';

type CatalogProductGridProps = {
  filters?: CatalogFilters;
};

export function CatalogProductGrid({ filters = {} }: CatalogProductGridProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '300px 0px',
  });

  const {
    data,
    error,
    isError,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProductsQuery(filters);

  const products = useMemo(() => {
    return [...(data?.pages.flatMap((page) => page.items) ?? [])].sort(
      (left, right) => Number(left.isUnavailable) - Number(right.isUnavailable)
    );
  }, [data]);

  useEffect(() => {
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;

    fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);


  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[0.75] animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        خطا در دریافت محصولات
        {error instanceof Error ? `: ${error.message}` : null}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-xl border bg-gray-50 p-8 text-center text-sm text-gray-500">
        محصولی یافت نشد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            inStock={product.inStock}
            
          />
        ))}
      </div>

      <div ref={ref} className="flex min-h-10 items-center justify-center">
        {isFetchingNextPage ? (
          <span className="text-sm text-gray-500">در حال بارگذاری محصولات بیشتر...</span>
        ) : hasNextPage ? (
          <span className="text-sm text-gray-400">برای بارگذاری بیشتر اسکرول کنید</span>
        ) : (
          <span className="text-sm text-gray-400">همه محصولات نمایش داده شدند</span>
        )}
      </div>
    </div>
  );
}
