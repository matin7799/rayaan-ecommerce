import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { getCatalogProducts } from '@/services/api/catalog.service';

import type { CatalogFilters, CatalogResponse } from '@/services/api/catalog.service';
import { mapCatalogProductToCard } from '@/components/catalog/catalog.utils';
import { ProductCardItem } from '@/types/catalog.types';

type MappedCatalogPage = {
  items: ProductCardItem[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
};

const toCatalogPage = (page: unknown): CatalogResponse => {
  if (page && typeof page === 'object' && 'data' in page) {
    const payload = (page as { data?: unknown }).data;

    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      'meta' in payload
    ) {
      return payload as CatalogResponse;
    }
  }

  return page as CatalogResponse;
};

export function useInfiniteProductsQuery(filters: CatalogFilters = {}) {
  return useInfiniteQuery<
    CatalogResponse,
    Error,
    InfiniteData<MappedCatalogPage>,
    [string, CatalogFilters],
    number
  >({
    queryKey: ['catalog-products', filters],
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      return getCatalogProducts({
        ...filters,
        page: pageParam,
        limit: filters.limit ?? 12,
      });
    },

    getNextPageParam: (lastPage) => {
      const catalog = toCatalogPage(lastPage);
      const { page, totalPages } = catalog.meta;
      return page < totalPages ? page + 1 : undefined;
    },

    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => {
        const catalog = toCatalogPage(page);

        return {
          items: catalog.data.map(mapCatalogProductToCard),
          meta: {
            itemsPerPage: catalog.meta.limit,
            totalItems: catalog.meta.total,
            currentPage: catalog.meta.page,
            totalPages: catalog.meta.totalPages,
          },
        };
      }),
    }),
  });
}
