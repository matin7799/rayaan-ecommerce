'use client';

import { Grid2x2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogSubcategoryItem } from '@/types/catalog-ui';

interface SubcategoryChipsProps {
  items: CatalogSubcategoryItem[];
  activeSlug?: string;
  onSelect?: (slug?: string) => void;
  className?: string;
}

export function SubcategoryChips({
  items,
  activeSlug,
  onSelect,
  className,
}: SubcategoryChipsProps) {
  if (!items?.length) return null;

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100">
        <Grid2x2 className="h-4 w-4 text-primary" />
        <span>زیر‌دسته‌ها</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect?.(undefined)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
            !activeSlug
              ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'border-zinc-200 bg-white hover:border-primary/40 hover:bg-primary/5 dark:border-zinc-800 dark:bg-zinc-950'
          )}
        >
          <Tag className="h-4 w-4" />
          همه
        </button>

        {items.map((item) => {
          const active = item.slug === activeSlug;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item.slug)}
              className={cn(
                'group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 dark:border-zinc-800 dark:bg-zinc-950'
              )}
            >
              <span>{item.name}</span>

              {typeof item.count === 'number' && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                  )}
                >
                  {new Intl.NumberFormat('fa-IR').format(item.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
