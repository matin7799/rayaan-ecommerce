'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface CatalogLoadingSkeletonProps {
  withHero?: boolean;
  items?: number;
  className?: string;
}

export function CatalogLoadingSkeleton({
  withHero = true,
  items = 12,
  className,
}: CatalogLoadingSkeletonProps) {
  return (
    <div className={className}>
      <div className="space-y-6">
        {withHero && (
          <div className="rounded-[28px] border border-zinc-200/70 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="space-y-4">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-10 w-80 rounded-xl" />
              <Skeleton className="h-4 max-w-2xl rounded-lg" />
              <Skeleton className="h-4 max-w-xl rounded-lg" />

              <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-56 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: items }).map((_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-zinc-200/70 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <Skeleton className="aspect-[4/4.8] w-full rounded-2xl" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-6 w-1/3 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
