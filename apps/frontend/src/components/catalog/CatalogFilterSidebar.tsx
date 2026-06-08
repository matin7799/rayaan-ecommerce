'use client';

import { useMemo, useState } from 'react';
import { Loader2, Trash2, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useCatalogFilters } from '@/hooks/catalog/useCatalogFilters';
import { formatPriceInput, parsePriceInput } from '@/lib/utils/price';
import { CategoryTree } from './CategoryTree';

interface CatalogFilterSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  rootCategorySlug?: string;
}

export function CatalogFilterSidebar({
  isMobile,
  onClose,
  rootCategorySlug,
}: CatalogFilterSidebarProps) {
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const { state, setFilter, toggleArrayValue, clearFilters } = useCatalogFilters();

  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  const [minPriceInput, setMinPriceInput] = useState(
    state.minPrice ? formatPriceInput(String(state.minPrice)) : '',
  );

  const [maxPriceInput, setMaxPriceInput] = useState(
    state.maxPrice ? formatPriceInput(String(state.maxPrice)) : '',
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (state.search) count += 1;
    if (state.brandSlugs?.length) count += state.brandSlugs.length;
    if (state.categorySlugs?.length) count += state.categorySlugs.length;
    if (state.minPrice) count += 1;
    if (state.maxPrice) count += 1;
    if (state.inStock) count += 1;
    if (state.isOnSale) count += 1;

    return count;
  }, [state]);

  const visibleCategories = useMemo(() => {
    if (!rootCategorySlug) return categories;

    const rootCategory = categories.find((category) => category.slug === rootCategorySlug);
    if (!rootCategory) return categories;

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

    return categories.filter((category) => descendantIds.has(category.id));
  }, [categories, rootCategorySlug]);

  const handleToggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      return next;
    });
  };

  const handleMinPriceChange = (value: string) => {
    const formatted = formatPriceInput(value);
    setMinPriceInput(formatted);

    const parsed = parsePriceInput(value);
    setFilter('minPrice', parsed || undefined);
  };

  const handleMaxPriceChange = (value: string) => {
    const formatted = formatPriceInput(value);
    setMaxPriceInput(formatted);

    const parsed = parsePriceInput(value);
    setFilter('maxPrice', parsed || undefined);
  };

  const handleClearFilters = () => {
    clearFilters();
    setMinPriceInput('');
    setMaxPriceInput('');
    setExpandedSlugs(new Set());

    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-full rounded-2xl border bg-white/50 p-4 shadow-sm dark:bg-zinc-900/50 lg:w-80">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="size-4" />
          <h3 className="text-sm font-semibold">فیلترها</h3>
          {activeFiltersCount > 0 ? (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
              {activeFiltersCount}
            </span>
          ) : null}
        </div>

        {activeFiltersCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            پاک کردن
          </Button>
        ) : null}
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] pr-3">
        <div className="space-y-6">
          {/* Categories */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold">دسته‌بندی</h4>

            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="size-4 animate-spin" />
                <span>در حال دریافت دسته‌بندی‌ها...</span>
              </div>
            ) : visibleCategories.length === 0 ? (
              <p className="text-sm text-zinc-500">دسته‌بندی‌ای پیدا نشد.</p>
            ) : (
              <CategoryTree
                categories={visibleCategories}
                selectedCategorySlugs={state.categorySlugs ?? []}
                expandedSlugs={expandedSlugs}
                onToggleCategory={(slug) => toggleArrayValue('categorySlugs', slug)}
                onToggleExpand={handleToggleExpand}
              />
            )}
          </section>

          {/* Brands */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">برندها</h4>

            {brandsLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="size-4 animate-spin" />
                <span>در حال دریافت برندها...</span>
              </div>
            ) : brands.length === 0 ? (
              <p className="text-sm text-zinc-500">برندی پیدا نشد.</p>
            ) : (
              <div className="space-y-2">
                {brands.map((brand: { slug: string; name: string }) => (
                  <Label
                    key={brand.slug}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="text-sm">{brand.name}</span>
                    <Checkbox
                      checked={(state.brandSlugs ?? []).includes(brand.slug)}
                      onCheckedChange={() =>
                        toggleArrayValue('brandSlugs', brand.slug)
                      }
                    />
                  </Label>
                ))}
              </div>
            )}
          </section>

          {/* Price */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">محدوده قیمت</h4>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="min-price">حداقل قیمت</Label>
                <Input
                  id="min-price"
                  inputMode="numeric"
                  value={minPriceInput}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  placeholder="مثلاً ۱,۰۰۰,۰۰۰"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max-price">حداکثر قیمت</Label>
                <Input
                  id="max-price"
                  inputMode="numeric"
                  value={maxPriceInput}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  placeholder="مثلاً ۵,۰۰۰,۰۰۰"
                />
              </div>
            </div>
          </section>

          {/* Toggles */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">وضعیت</h4>

            <div className="flex items-center justify-between rounded-xl px-3 py-2">
              <Label htmlFor="in-stock">فقط کالاهای موجود</Label>
              <Switch
                id="in-stock"
                checked={Boolean(state.inStock)}
                onCheckedChange={(checked) =>
                  setFilter('inStock', checked || undefined)
                  
                }
                className="bg-zinc-200 dark:bg-zinc-700 data-checked:bg-zinc-900 dark:data-checked:bg-white *:data-[slot=switch-thumb]:bg-white *:data-[slot=switch-thumb]:dark:bg-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl px-3 py-2">
              <Label htmlFor="on-sale">فقط تخفیف‌دارها</Label>
              <Switch
                id="on-sale"
                checked={Boolean(state.isOnSale)}
                onCheckedChange={(checked) =>
                  setFilter('isOnSale', checked || undefined)
                }
                className="bg-zinc-200 dark:bg-zinc-700 data-checked:bg-zinc-900 dark:data-checked:bg-white *:data-[slot=switch-thumb]:bg-white *:data-[slot=switch-thumb]:dark:bg-zinc-900"
              />
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
}
