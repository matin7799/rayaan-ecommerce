'use client';

import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogMobileToolbarProps {
  activeFiltersCount: number;
  sortLabel?: string;
  onOpenFilters: () => void;
  onOpenSort: () => void;
}

export function CatalogMobileToolbar({
  activeFiltersCount,
  sortLabel = 'مرتب‌سازی',
  onOpenFilters,
  onOpenSort,
}: CatalogMobileToolbarProps) {
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-xl"
          onClick={onOpenSort}
        >
          <ArrowUpDown className="ml-2 size-4" />
          <span className="truncate">{sortLabel}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="relative h-11 flex-1 rounded-xl"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="ml-2 size-4" />
          <span>فیلترها</span>

          {activeFiltersCount > 0 && (
            <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
