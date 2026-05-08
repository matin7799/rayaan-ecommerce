'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  buildCatalogFilters,
  parseCatalogSearchParams,
  type CatalogQueryState,
} from '@/components/catalog/catalog.utils';

type ArrayFilterKey = 'brandSlugs' | 'categorySlugs';

export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseCatalogSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const filters = useMemo(() => buildCatalogFilters(state), [state]);

  const updateState = (updater: (draft: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);

    // whenever filters change, reset pagination
    params.delete('page');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setSingleValue = (key: string, value?: string) => {
    updateState((params) => {
      if (!value || value.trim() === '') {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });
  };

  const setFilter = <K extends keyof CatalogQueryState>(
    key: K,
    value: CatalogQueryState[K] | undefined,
  ) => {
    updateState((params) => {
      // array fields should be handled only by toggleArrayValue / setArrayFilter
      if (key === 'brandSlugs' || key === 'categorySlugs') {
        params.delete(key);

        const values = Array.isArray(value) ? value : [];
        values.forEach((item) => {
          if (item) params.append(key, String(item));
        });

        return;
      }

      // remove empty values
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === false
      ) {
        params.delete(String(key));
        return;
      }

      // booleans => "true"
      if (typeof value === 'boolean') {
        params.set(String(key), 'true');
        return;
      }

      // numbers
      if (typeof value === 'number') {
        if (Number.isNaN(value) || value <= 0) {
          params.delete(String(key));
        } else {
          params.set(String(key), String(value));
        }
        return;
      }

      // strings
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          params.delete(String(key));
        } else {
          params.set(String(key), trimmed);
        }
        return;
      }

      // fallback
      params.set(String(key), String(value));
    });
  };

  const toggleArrayValue = (key: ArrayFilterKey, value: string) => {
    updateState((params) => {
      const current = params.getAll(key);
      const exists = current.includes(value);

      params.delete(key);

      const next = exists
        ? current.filter((item) => item !== value)
        : [...current, value];

      next.forEach((item) => params.append(key, item));
    });
  };

  const setArrayFilter = (key: ArrayFilterKey, values: string[]) => {
    updateState((params) => {
      params.delete(key);

      values
        .filter(Boolean)
        .forEach((item) => params.append(key, item));
    });
  };

  const setPriceRange = (minPrice?: number, maxPrice?: number) => {
    updateState((params) => {
      if (minPrice && minPrice > 0) {
        params.set('minPrice', String(minPrice));
      } else {
        params.delete('minPrice');
      }

      if (maxPrice && maxPrice > 0) {
        params.set('maxPrice', String(maxPrice));
      } else {
        params.delete('maxPrice');
      }
    });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return {
    state,
    filters,
    setSingleValue,
    setFilter,
    toggleArrayValue,
    setArrayFilter,
    setPriceRange,
    clearFilters,
  } satisfies {
    state: CatalogQueryState;
    filters: ReturnType<typeof buildCatalogFilters>;
    setSingleValue: (key: string, value?: string) => void;
    setFilter: <K extends keyof CatalogQueryState>(
      key: K,
      value: CatalogQueryState[K] | undefined,
    ) => void;
    toggleArrayValue: (key: ArrayFilterKey, value: string) => void;
    setArrayFilter: (key: ArrayFilterKey, values: string[]) => void;
    setPriceRange: (minPrice?: number, maxPrice?: number) => void;
    clearFilters: () => void;
  };
}
