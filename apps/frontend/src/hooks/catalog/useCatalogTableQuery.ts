'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCatalogProducts } from '@/services/api/catalog.service';
import { catalogTableConfig, type CatalogTableQueryState } from '@/types/catalog-table';
import {
  buildCatalogTableFilters,
  mapCatalogTableResult,
  parseCatalogTableSearchParams,
} from '@/utils/catalog-table';

export function useCatalogTableQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseCatalogTableSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const filters = useMemo(
    () => buildCatalogTableFilters(state, catalogTableConfig.enableSubcategoryFilter),
    [state],
  );

  const query = useQuery({
    queryKey: ['catalog-table-products', filters],
    queryFn: () => getCatalogProducts(filters),
    select: mapCatalogTableResult,
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });

  const updateState = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const setState = <K extends keyof CatalogTableQueryState>(
    key: K,
    value: CatalogTableQueryState[K] | undefined,
  ) => {
    updateState((params) => {
      const keyName = String(key);
      if (keyName === 'brandSlugs') {
        params.delete('brand');
        (Array.isArray(value) ? value : []).forEach((item) => {
          if (item) params.append('brand', item);
        });
        params.delete('page');
        return;
      }

      if (value === undefined || value === null || value === '') {
        params.delete(keyName);
        if (keyName !== 'page') params.delete('page');
        return;
      }

      params.set(keyName, String(value));
      if (keyName !== 'page') params.delete('page');
    });
  };

  const setManyState = (updates: Partial<CatalogTableQueryState>) => {
    updateState((params) => {
      Object.entries(updates).forEach(([key, rawValue]) => {
        const value = rawValue as CatalogTableQueryState[keyof CatalogTableQueryState];

        if (key === 'brandSlugs') {
          params.delete('brand');
          (Array.isArray(value) ? value : []).forEach((item) => {
            if (item) params.append('brand', item);
          });
          return;
        }

        if (value === undefined || value === null || value === '') {
          params.delete(key);
          return;
        }

        params.set(key, String(value));
      });

      params.delete('page');
    });
  };

  const resetFilters = () => {
    updateState((params) => {
      [
        'category',
        'subcategory',
        'brand',
        'search',
        'minPrice',
        'maxPrice',
        'sortBy',
        'sortOrder',
        'page',
      ].forEach((key) => params.delete(key));
      params.set('limit', String(state.limit));
    });
  };

  return {
    ...query,
    state,
    filters,
    setState,
    setManyState,
    resetFilters,
    enableSubcategoryFilter: catalogTableConfig.enableSubcategoryFilter,
  };
}
