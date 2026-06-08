'use client';

import { ArrowUpDown, Filter, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { CatalogSortBy, CatalogSortOrder } from '@/types/catalog-ui';

interface CatalogToolbarProps {
  total: number;
  sortBy?: CatalogSortBy;
  sortOrder?: CatalogSortOrder;
  activeFiltersCount?: number;
  onSortChange: (value: { sortBy: CatalogSortBy; sortOrder: CatalogSortOrder }) => void;
  onOpenFilters?: () => void;
  className?: string;
}

const SORT_OPTIONS: Array<{
  label: string;
  value: { sortBy: CatalogSortBy; sortOrder: CatalogSortOrder };
}> = [
  { label: 'جدیدترین', value: { sortBy: 'createdAt', sortOrder: 'DESC' } },
  { label: 'ارزان‌ترین', value: { sortBy: 'basePrice', sortOrder: 'ASC' } },
  { label: 'گران‌ترین', value: { sortBy: 'basePrice', sortOrder: 'DESC' } },
  { label: 'نام: الف تا ی', value: { sortBy: 'name', sortOrder: 'ASC' } },
  { label: 'نام: ی تا الف', value: { sortBy: 'name', sortOrder: 'DESC' } },
];

function encodeSort(sortBy?: CatalogSortBy, sortOrder?: CatalogSortOrder) {
  return `${sortBy || 'createdAt'}:${sortOrder || 'DESC'}`;
}

function decodeSort(value: string): { sortBy: CatalogSortBy; sortOrder: CatalogSortOrder } {
  const [sortBy, sortOrder] = value.split(':') as [CatalogSortBy, CatalogSortOrder];
  return {
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
  };
}

export function CatalogToolbar({
  total,
  sortBy = 'createdAt',
  sortOrder = 'DESC',
  activeFiltersCount = 0,
  onSortChange,
  onOpenFilters,
  className,
}: CatalogToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/85',
        'md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">نتیجه کاتالوگ</p>
          <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
            {new Intl.NumberFormat('fa-IR').format(total)} محصول
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-primary/30 hover:bg-primary/5 md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <Filter className="h-4 w-4" />
          فیلترها

          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {new Intl.NumberFormat('fa-IR').format(activeFiltersCount)}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <ArrowUpDown className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">مرتب‌سازی:</span>

          <select
            value={encodeSort(sortBy, sortOrder)}
            onChange={(e) => onSortChange(decodeSort(e.target.value))}
            className="bg-transparent text-sm font-semibold text-zinc-800 outline-none dark:text-zinc-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={`${option.value.sortBy}-${option.value.sortOrder}`}
                value={encodeSort(option.value.sortBy, option.value.sortOrder)}
                className="text-zinc-900"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
