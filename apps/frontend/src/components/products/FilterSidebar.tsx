// apps/frontend/src/components/products/FilterSidebar.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatPriceInput, parsePriceInput } from '@/lib/utils/price';
import { Trash2, Check, Loader2 } from 'lucide-react';

// Hooks
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';

// UI Components from shadcn/ui
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FilterSidebarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function FilterSidebar({ className, isMobile, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch dynamic data
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Derive values from URL params
  const urlMinPrice = useMemo(() => searchParams.get('minPrice') || '', [searchParams]);
  const urlMaxPrice = useMemo(() => searchParams.get('maxPrice') || '', [searchParams]);

  // --- Handlers ---
  const updateUrlParams = (params: URLSearchParams) => {
    // Reset page number on filter change
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleSingleParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page'); // Reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleArrayParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);
    params.delete(key);

    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    newValues.forEach((v) => params.append(key, v));
    updateUrlParams(params);
  };

  const handleInStockChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    updateUrlParams(params);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    const minValue = parsePriceInput(minPrice);
    const maxValue = parsePriceInput(maxPrice);

    if (minValue > 0) {
      params.set('minPrice', String(minValue));
    } else {
      params.delete('minPrice');
    }

    if (maxValue > 0) {
      params.set('maxPrice', String(maxValue));
    } else {
      params.delete('maxPrice');
    }

    updateUrlParams(params);
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPriceInput(e.target.value);
    setMinPrice(formatted);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPriceInput(e.target.value);
    setMaxPrice(formatted);
  };

  // --- Active States ---
  const activeCategory = searchParams.get('category');
  const activeBrands = searchParams.getAll('brandId');
  const inStockOnly = searchParams.get('inStock') === 'true';
  const hasActiveFilters = searchParams.toString().length > 0;

  // Flatten categories (if tree structure, show only top-level or flatten)
  const flatCategories = useMemo(() => {
    // If you want to show only parent categories:
    return categories.filter((cat) => !cat.parentId);
    
    // Or if you want to flatten all:
    // const flatten = (cats: Category[]): Category[] => {
    //   return cats.flatMap((cat) => [cat, ...(cat.children ? flatten(cat.children) : [])]);
    // };
    // return flatten(categories);
  }, [categories]);

  return (
    <aside className={cn('w-full lg:w-70 shrink-0', className)}>
      <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">فیلترها</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف همه
            </Button>
          )}
        </div>

        {/* In Stock Toggle */}
        <Label
          htmlFor="in-stock"
          className="flex items-center justify-between cursor-pointer group"
        >
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            فقط کالاهای موجود
          </span>
          <Switch
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={handleInStockChange}
            className="bg-zinc-200 dark:bg-zinc-700 data-checked:bg-zinc-900 dark:data-checked:bg-white *:data-[slot=switch-thumb]:bg-white *:data-[slot=switch-thumb]:dark:bg-zinc-900"
          />
        </Label>

        {/* Categories */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">دسته‌بندی</h4>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : flatCategories.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 py-2">
              دسته‌بندی‌ای یافت نشد
            </p>
          ) : (
            <ul className="space-y-1.5">
              {flatCategories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => toggleSingleParam('category', cat.slug)}
                      className={cn(
                        'group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-200',
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                      )}
                    >
                      <span>{cat.name}</span>
                      {isActive && <Check className="w-4 h-4 text-zinc-900 dark:text-white" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Brands */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">برندها</h4>
          {brandsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : brands.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 py-2">برندی یافت نشد</p>
          ) : (
            <div className="space-y-3">
              {brands.map((brand) => (
                <Label key={brand.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={activeBrands.includes(brand.id)}
                    onCheckedChange={() => toggleArrayParam('brandId', brand.id)}
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">{brand.name}</span>
                </Label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            محدوده قیمت (تومان)
          </h4>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="از"
              value={minPrice}
              onChange={handleMinPriceChange}
              className="bg-zinc-50 dark:bg-zinc-800/50"
            />
            <span className="text-zinc-400">-</span>
            <Input
              type="text"
              placeholder="تا"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="bg-zinc-50 dark:bg-zinc-800/50"
            />
          </div>
          <Button onClick={applyPriceFilter} variant="secondary" className="w-full">
            اعمال قیمت
          </Button>
        </div>

        {/* Mobile View Results Button */}
        {isMobile && onClose && (
          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 sticky bottom-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl -mx-5 -mb-5 px-5 pb-5">
            <Button onClick={onClose} size="lg" className="w-full shadow-lg shadow-zinc-900/20">
              مشاهده نتایج
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
