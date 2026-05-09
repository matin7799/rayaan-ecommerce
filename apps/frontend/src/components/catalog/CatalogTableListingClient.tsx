'use client';

import { Fragment, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { useCatalogTableQuery } from '@/hooks/catalog/useCatalogTableQuery';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatPersianPrice, formatPriceInput, parsePriceInput } from '@/lib/utils/price';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import type { ProductCardItem } from '@/types/catalog.types';
import { apiClient } from '@/services/api-client';

const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';

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
    setManyState,
    resetFilters,
    enableSubcategoryFilter,
  } = useCatalogTableQuery();
  const { data: categories = [] } = useCategories();

  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [loadingQuickViewId, setLoadingQuickViewId] = useState<string | null>(null);

  const mainCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const subcategories = useMemo(() => {
    if (!state.category) return [];
    const selectedMain = categories.find((category) => category.slug === state.category);
    if (!selectedMain) return [];
    return categories.filter((category) => category.parentId === selectedMain.id);
  }, [categories, state.category]);

  const filteredRows = useMemo(() => {
    if (!data) return [];

    return data.rawItems
      .filter((item) => {
        const categorySlugs = (item.categories ?? []).map((category) => category.slug);
        if (state.category && !categorySlugs.includes(state.category)) return false;
        if (state.subcategory && !categorySlugs.includes(state.subcategory)) return false;

        const visiblePrice = item.pricing.finalPrice ?? item.pricing.basePrice;
        if (state.minPrice && visiblePrice < state.minPrice) return false;
        if (state.maxPrice && visiblePrice > state.maxPrice) return false;
        return true;
      })
      .map((item) => data.rows.find((row) => row.id === item.id))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  }, [data, state.category, state.subcategory, state.minPrice, state.maxPrice]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, typeof filteredRows>();
    filteredRows.forEach((row) => {
      const key = `${row.mainCategory}__${row.subcategory ?? 'بدون زیردسته'}`;
      const current = groups.get(key) ?? [];
      current.push(row);
      groups.set(key, current);
    });

    return Array.from(groups.entries()).map(([key, rows]) => {
      const [mainCategory, subcategory] = key.split('__');
      return { key, mainCategory, subcategory, rows };
    });
  }, [filteredRows]);

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
    <div className="container mx-auto space-y-4 px-3 py-6 sm:px-4">
      <div className="space-y-3 rounded-2xl border bg-background p-3 sm:p-4">
        <h1 className="text-lg font-bold sm:text-2xl">جدول محصولات</h1>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={state.category ?? 'all'}
            onValueChange={(value) => {
              const normalizedValue =
                !value || value === 'all' ? undefined : String(value);
              setManyState({
                category: normalizedValue,
                subcategory: undefined,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="دسته اصلی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {mainCategories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {enableSubcategoryFilter ? (
            <Select
              value={state.subcategory ?? 'all'}
              onValueChange={(value) => {
                const normalizedValue =
                  !value || value === 'all' ? undefined : String(value);
                setState('subcategory', normalizedValue);
              }}
              disabled={!state.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="زیردسته" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه زیردسته‌ها</SelectItem>
                {subcategories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

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
          <div className="hidden rounded-2xl border bg-background p-2 md:block">
            <Table dir='rtl'>
              <TableHeader dir='rtl'>
                <TableRow dir='rtl'>
                  <TableHead>تصویر</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>قیمت</TableHead>
                  {isPartner ? <TableHead>قیمت همکار</TableHead> : null}
                  <TableHead>مشاهده</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRows.map((group) => (
                  <Fragment key={group.key}>
                    <TableRow>
                      <TableCell colSpan={isPartner ? 6 : 5} className="bg-muted/40 font-semibold">
                        {group.mainCategory} {'>'} {group.subcategory}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                            <Image src={row.imageUrl} alt={row.imageAlt} fill sizes="48px" className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>{row.sku}</TableCell>
                        <TableCell className="max-w-[280px] whitespace-normal break-words font-medium leading-6">
                          {row.title}
                        </TableCell>
                        <TableCell>{formatPersianPrice(row.finalPrice ?? row.basePrice)} تومان</TableCell>
                        {isPartner ? (
                          <TableCell>
                            {typeof row.collaboratorPrice === 'number'
                              ? `${formatPersianPrice(row.collaboratorPrice)} تومان`
                              : 'ناموجود'}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => openQuickView(row.id)}>
                            {loadingQuickViewId === row.id ? 'در حال بارگذاری...' : 'مشاهده'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 md:hidden">
            {groupedRows.map((group) => (
              <div key={`${group.key}-mobile`} className="space-y-2">
                <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm font-semibold">
                  {group.mainCategory} {'>'} {group.subcategory}
                </div>
                {group.rows.map((row) => (
                  <div key={row.id} className="rounded-2xl border bg-background p-3">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="relative size-14 overflow-hidden rounded-lg bg-muted">
                        <Image src={row.imageUrl} alt={row.imageAlt} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-6 break-words">{row.title}</p>
                        <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>قیمت: {formatPersianPrice(row.finalPrice ?? row.basePrice)} تومان</p>
                      {isPartner ? (
                        <p>
                          قیمت همکار:{' '}
                          {typeof row.collaboratorPrice === 'number'
                            ? `${formatPersianPrice(row.collaboratorPrice)} تومان`
                            : 'ناموجود'}
                        </p>
                      ) : null}
                    </div>
                    <Button className="mt-3 w-full" variant="outline" onClick={() => openQuickView(row.id)}>
                      {loadingQuickViewId === row.id ? 'در حال بارگذاری...' : 'مشاهده'}
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
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
