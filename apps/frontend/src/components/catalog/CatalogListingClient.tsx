'use client';

import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CatalogFilterSidebar } from '@/components/catalog/CatalogFilterSidebar';
import { CatalogProductGrid } from '@/components/catalog/CatalogProductGrid';
import { SortBar } from '@/components/catalog/CatalogSortBar';
import { useCatalogFilters } from '@/hooks/catalog/useCatalogFilters';
import { useCategories } from '@/hooks/useCategories';

interface CatalogListingClientProps {
  title?: string;
  rootCategorySlug?: string;
}

export function CatalogListingClient({
  title = 'همه محصولات',
  rootCategorySlug,
}: CatalogListingClientProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { filters } = useCatalogFilters();
  const { data: categories = [] } = useCategories();

  const rootCategory = useMemo(() => {
    if (!rootCategorySlug) return undefined;

    return categories.find((category) => category.slug === rootCategorySlug);
  }, [categories, rootCategorySlug]);

  const resolvedTitle = useMemo(() => {
    // اگر در صفحه دسته‌بندی هستیم، title را فقط از category.name بساز
    // و هرگز به slug fallback نکن
    if (rootCategorySlug) {
      return rootCategory?.name ?? 'دسته‌بندی';
    }

    return title;
  }, [rootCategorySlug, rootCategory, title]);

  const scopedCategorySlugs = useMemo(() => {
    if (!rootCategorySlug) return undefined;
    if (!rootCategory) return [rootCategorySlug];

    const queue = [rootCategory.id];
    const descendantIds = new Set<string>([rootCategory.id]);

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) continue;

      categories.forEach((category) => {
        if ((category.parentId ?? null) === currentId && !descendantIds.has(category.id)) {
          descendantIds.add(category.id);
          queue.push(category.id);
        }
      });
    }

    return categories
      .filter((category) => descendantIds.has(category.id))
      .map((category) => category.slug);
  }, [categories, rootCategorySlug, rootCategory]);

  const resolvedFilters = useMemo(() => {
    if (!scopedCategorySlugs || scopedCategorySlugs.length === 0) {
      return filters;
    }

    const currentSlugs = filters.categorySlugs ?? [];
    const hasUserSelectedCategory = currentSlugs.length > 0;

    if (!hasUserSelectedCategory) {
      return {
        ...filters,
        categorySlugs: scopedCategorySlugs,
      };
    }

    const intersection = currentSlugs.filter((slug) => scopedCategorySlugs.includes(slug));

    return {
      ...filters,
      categorySlugs: intersection.length > 0 ? intersection : scopedCategorySlugs,
    };
  }, [filters, scopedCategorySlugs]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{resolvedTitle}</h1>

          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
              <Filter className="size-4" />
              فیلترها
            </SheetTrigger>

            <SheetContent side="right" className="bg-gray-50/20 dark:bg-gray-200/20 backdrop-blur-xl flex w-full flex-col p-0 sm:w-95">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-right text-lg font-bold">
                  فیلتر محصولات
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4">
                <CatalogFilterSidebar rootCategorySlug={rootCategorySlug} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <SortBar />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="hidden lg:block lg:w-80 lg:shrink-0">
          <div className="sticky top-24">
            <CatalogFilterSidebar rootCategorySlug={rootCategorySlug} />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 hidden items-center justify-between border-b border-border pb-4 lg:flex">
            <h1 className="text-3xl font-bold">{resolvedTitle}</h1>
            <SortBar />
          </div>

          <CatalogProductGrid filters={resolvedFilters} />
        </section>
      </div>
    </div>
  );
}
