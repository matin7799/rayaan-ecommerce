'use client';

import { JSX, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { useCatalogTableQuery } from '@/hooks/catalog/useCatalogTableQuery';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatPriceInput, parsePriceInput } from '@/lib/utils/price';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import type { ProductCardItem } from '@/types/catalog.types';
import { apiClient } from '@/services/api-client';
import { CatalogTableListingDesktop } from './CatalogTableListingDesktop';
import { CatalogTableListingMobile } from './CatalogTableListingMobile';

const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';

type SortDirection = 'asc' | 'desc';

export function CatalogTableListingClient() {
  const { user } = useAuthStore();
  const isPartner = ['partner', 'collaborator'].includes(
    String(user?.role ?? '').toLowerCase(),
  );

  const {
    data,
    isLoading,
    isError,
    state,
    setState,
    resetFilters,
  } = useCatalogTableQuery();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [loadingQuickViewId, setLoadingQuickViewId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [priceSort, setPriceSort] = useState<SortDirection>('asc');

  const [expandedCategorySlugs, setExpandedCategorySlugs] = useState<Set<string>>(new Set());

  const filteredRows = useMemo(() => {
    if (!data) return [];

    const rows = data.rawItems
      .filter((item) => {
        const categorySlugs = (item.categories ?? []).map((category) => category.slug);
        if (
          state.categorySlugs.length > 0 &&
          !state.categorySlugs.some((slug) => categorySlugs.includes(slug))
        ) {
          return false;
        }

        if (
          state.brandSlugs.length > 0 &&
          !state.brandSlugs.includes(item.brand?.slug ?? '')
        ) {
          return false;
        }

        const visiblePrice = item.pricing.finalPrice ?? item.pricing.basePrice;
        if (state.minPrice && visiblePrice < state.minPrice) return false;
        if (state.maxPrice && visiblePrice > state.maxPrice) return false;
        return true;
      })
      .map((item) => data.rows.find((row) => row.id === item.id))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    return rows;
  }, [data, state.categorySlugs, state.brandSlugs, state.minPrice, state.maxPrice]);

  const flatCategories = useMemo(() => {
    type TreeCategory = (typeof categories)[number] & {
      children?: TreeCategory[];
    };

    const result: TreeCategory[] = [];
    const seen = new Set<string>();

    const walk = (nodes: TreeCategory[]) => {
      nodes.forEach((node) => {
        if (!node?.id || seen.has(node.id)) return;
        seen.add(node.id);
        result.push(node);
        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children);
        }
      });
    };

    walk(categories as TreeCategory[]);
    return result;
  }, [categories]);

  const categoryBySlug = useMemo(
    () => new Map(flatCategories.map((category) => [category.slug, category])),
    [flatCategories],
  );

  const groupedRows = useMemo(() => {
    if (!data) return [];

    const rowById = new Map(filteredRows.map((row) => [row.id, row]));
    const mainGroups = new Map<string, Map<string, typeof filteredRows>>();

    data.rawItems.forEach((item) => {
      const row = rowById.get(item.id);
      if (!row) return;

      const matchedCategories = (item.categories ?? [])
        .map((category) => categoryBySlug.get(category.slug))
        .filter(Boolean);
      const matchedCategory =
        matchedCategories.find((category) => Boolean(category?.parentId)) ??
        matchedCategories[0];

      const resolvedMain = matchedCategory?.parentId
        ? flatCategories.find((category) => category.id === matchedCategory.parentId)?.name ??
          row.mainCategory
        : matchedCategory?.name ?? row.mainCategory;

      const resolvedSub =
        matchedCategory?.parentId
          ? matchedCategory.name
          : row.subcategory ?? 'بدون زیردسته';

      const subGroups = mainGroups.get(resolvedMain) ?? new Map<string, typeof filteredRows>();
      const current = subGroups.get(resolvedSub) ?? [];
      current.push(row);
      subGroups.set(resolvedSub, current);
      mainGroups.set(resolvedMain, subGroups);
    });

    return Array.from(mainGroups.entries()).map(([mainCategory, subGroups]) => ({
      mainCategory,
      subgroups: Array.from(subGroups.entries()).map(([subcategory, rows]) => {
        const sortedRows = [...rows].sort((left, right) => {
          const leftPrice = left.finalPrice ?? left.basePrice;
          const rightPrice = right.finalPrice ?? right.basePrice;
          return priceSort === 'asc' ? leftPrice - rightPrice : rightPrice - leftPrice;
        });

        return {
          key: `${mainCategory}__${subcategory}`,
          subcategory,
          rows: sortedRows,
        };
      }),
    }));
  }, [data, filteredRows, flatCategories, categoryBySlug, priceSort]);

  const toggleCategory = (slug: string) => {
    const next = state.categorySlugs.includes(slug)
      ? state.categorySlugs.filter((item) => item !== slug)
      : [...state.categorySlugs, slug];
    setState('categorySlugs', next);
  };

  const toggleBrand = (slug: string) => {
    const next = state.brandSlugs.includes(slug)
      ? state.brandSlugs.filter((item) => item !== slug)
      : [...state.brandSlugs, slug];
    setState('brandSlugs', next);
  };

  const toggleExpandCategory = (slug: string) => {
    setExpandedCategorySlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const togglePriceSort = () => {
    setPriceSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const renderPriceSortIcon = () => {
    if (priceSort === 'asc') return <ArrowUp className="size-4" />;
    if (priceSort === 'desc') return <ArrowDown className="size-4" />;
    return <ArrowUpDown className="size-4" />;
  };

  const renderCategoryNodes = (parentId: string | null = null, level = 0): JSX.Element[] => {
    const normalizedSearch = categorySearch.trim().toLowerCase();
    const nodes = flatCategories.filter((cat) => (cat.parentId ?? null) === parentId);
    return nodes.map((node) => {
      const children = flatCategories.filter((cat) => cat.parentId === node.id);
      const isExpanded = expandedCategorySlugs.has(node.slug);
      const isSelected = state.categorySlugs.includes(node.slug);
      const matchesSelf = node.name.toLowerCase().includes(normalizedSearch);
      const matchesChild =
        normalizedSearch.length > 0 &&
        flatCategories.some(
          (cat) =>
            cat.parentId === node.id && cat.name.toLowerCase().includes(normalizedSearch),
        );

      if (normalizedSearch && !matchesSelf && !matchesChild) {
        return null;
      }

      return (
        <div key={node.id} className="mb-1 rounded-md border p-2">
          <div className="flex items-center justify-between gap-2" style={{ paddingRight: `${level * 14}px` }}>
            <button
              type="button"
              className="flex items-center gap-2 text-sm"
              onClick={() => children.length > 0 && toggleExpandCategory(node.slug)}
            >
              {children.length ? (
                isExpanded ? <ChevronDown className="size-4" /> : <ChevronLeft className="size-4" />
              ) : (
                <span className="inline-block w-4" />
              )}
              <span>{node.name}</span>
            </button>
            <Checkbox checked={isSelected} onCheckedChange={() => toggleCategory(node.slug)} />
          </div>
          {children.length > 0 && (isExpanded || normalizedSearch.length > 0) ? (
            <div className="mt-2">{renderCategoryNodes(node.id, level + 1)}</div>
          ) : null}
        </div>
      );
    }).filter(Boolean) as JSX.Element[];
  };

  const openQuickView = async (productId: string) => {
    const item = data?.rawItems.find((product) => product.id === productId);
    if (!item) return;

    setLoadingQuickViewId(productId);
    setQuickViewProduct({
      id: item.id,
      slug: item.slug,
      title: item.name,
      brand: item.brand?.name ?? 'بدون برند',
      thumbnail: item.thumbnail?.url ?? PLACEHOLDER_IMAGE,
      thumbnailAlt: item.thumbnail?.alt ?? item.name,
      images: [],
      price: item.pricing.basePrice,
      discountPrice:
        item.pricing.finalPrice < item.pricing.basePrice ? item.pricing.finalPrice : undefined,
      inStock: item.stockQuantity > 0,
      rating: item.rating ?? 0,
      reviewsCount: item.reviewsCount ?? 0,
      specs: [],
    });
    setIsQuickViewOpen(true);

    try {
      const response = await apiClient.get(`/catalog/products/${item.slug}`);
      const payload = response.data;
      const detail = payload?.data?.data ?? payload?.data ?? payload;
      const attributes = Array.isArray(detail?.attributes) ? detail.attributes : [];
      const gallery = Array.isArray(detail?.media?.gallery) ? detail.media.gallery : [];
      const images = gallery
        .slice()
        .sort(
          (left: { order?: number }, right: { order?: number }) =>
            (left?.order ?? 0) - (right?.order ?? 0),
        )
        .map((media: { url?: string }) => media?.url)
        .filter((url: string | undefined): url is string => Boolean(url));

      setQuickViewProduct((prev) =>
        prev
          ? {
              ...prev,
              images,
              specs: attributes.map((attribute: { key?: string; value?: string }) => ({
                label: attribute?.key ?? '-',
                value: attribute?.value ?? '-',
              })),
            }
          : prev,
      );
    } finally {
      setLoadingQuickViewId(null);
    }
  };

  return (
    <div className="container mx-auto space-y-5 px-3 py-6 sm:px-4">
      <div className="space-y-4 rounded-2xl border bg-gradient-to-b from-background to-muted/30 p-3 shadow-sm sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold sm:text-2xl">جدول محصولات</h1>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {filteredRows.length} کالا
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Popover>
            <PopoverTrigger className="inline-flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground">
              <span className="truncate">
                {state.categorySlugs.length > 0
                  ? `${state.categorySlugs.length} دسته انتخاب شده`
                  : 'انتخاب دسته‌بندی'}
              </span>
              <ChevronDown className="size-4 opacity-60" />
            </PopoverTrigger>
            <PopoverContent className="bg-gray-50/20 max-h-80 w-[320px] overflow-auto p-2 backdrop-blur-xl dark:bg-gray-200/20" align="start">
              <div className="mb-2">
                <Input
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="جستجوی دسته‌بندی..."
                  className="h-8"
                />
              </div>
              {renderCategoryNodes(null, 0)}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="inline-flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground">
              <span className="truncate">
                {state.brandSlugs.length > 0
                  ? `${state.brandSlugs.length} برند انتخاب شده`
                  : 'انتخاب برند'}
              </span>
              <ChevronDown className="size-4 opacity-60" />
            </PopoverTrigger>
            <PopoverContent className="max-h-80 w-[280px] overflow-auto bg-gray-50/20 p-2 backdrop-blur-xl dark:bg-gray-200/20" align="start">
              <div className="mb-2">
                <Input
                  value={brandSearch}
                  onChange={(event) => setBrandSearch(event.target.value)}
                  placeholder="جستجوی برند..."
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                {brands
                  .filter((brand) =>
                    brand.name.toLowerCase().includes(brandSearch.trim().toLowerCase()),
                  )
                  .map((brand) => (
                    <label key={brand.id} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                      <span>{brand.name}</span>
                      <Checkbox
                        checked={state.brandSlugs.includes(brand.slug)}
                        onCheckedChange={() => toggleBrand(brand.slug)}
                      />
                    </label>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          <Input
            inputMode="numeric"
            placeholder="حداقل قیمت"
            value={state.minPrice ? formatPriceInput(String(state.minPrice)) : ''}
            onChange={(event) =>
              setState('minPrice', parsePriceInput(event.target.value) || undefined)
            }
          />
          <Input
            inputMode="numeric"
            placeholder="حداکثر قیمت"
            value={state.maxPrice ? formatPriceInput(String(state.maxPrice)) : ''}
            onChange={(event) =>
              setState('maxPrice', parsePriceInput(event.target.value) || undefined)
            }
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={resetFilters}>
            پاک‌سازی فیلترها
          </Button>
        </div>
      </div>

      {isLoading ? <div className="rounded-2xl border p-8 text-center">در حال بارگذاری...</div> : null}
      {isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">خطا در دریافت محصولات</div> : null}

      {!isLoading && !isError && data ? (
        <>
          <CatalogTableListingDesktop
            groupedRows={groupedRows}
            isPartner={isPartner}
            togglePriceSort={togglePriceSort}
            renderPriceSortIcon={renderPriceSortIcon}
            loadingQuickViewId={loadingQuickViewId}
            openQuickView={openQuickView}
          />

          <CatalogTableListingMobile
            groupedRows={groupedRows}
            isPartner={isPartner}
            togglePriceSort={togglePriceSort}
            renderPriceSortIcon={renderPriceSortIcon}
            loadingQuickViewId={loadingQuickViewId}
            openQuickView={openQuickView}
          />
        </>
      ) : null}

      <ProductQuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
}
