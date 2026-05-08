import { useQuery } from '@tanstack/react-query';
import { CatalogResponse, fetchProducts } from '@/services/catalog.service';
import type { ProductsQueryParams } from '@/types/catalog.types';
import { CatalogListItem, mapCatalogProductToCard } from '@/components/catalog/catalog.utils';
import type { CatalogFilters } from '@/services/catalog.service';

interface ProductsQueryResult {
  products: CatalogListItem[];
  meta?: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export function useProductsQuery(params: ProductsQueryParams = {}) {
  const normalizedParams: CatalogFilters = {
    page: params.page,
    limit: params.limit,
    search: params.search,
    category: params.categoryId,
    ...(params.sort === 'newest'
      ? { sortBy: 'createdAt' as const, sortOrder: 'DESC' as const }
      : params.sort === 'price_asc'
        ? { sortBy: 'basePrice' as const, sortOrder: 'ASC' as const }
        : params.sort === 'price_desc'
          ? { sortBy: 'basePrice' as const, sortOrder: 'DESC' as const }
          : {}),
  };

  return useQuery<CatalogResponse, Error, ProductsQueryResult>({
    queryKey: ['catalog-products', params],
    queryFn: () => fetchProducts(normalizedParams),

    select: (data) => {
      const envelope = Array.isArray(data) ? data[0] : data;
      const catalog = envelope?.data;

      return {
        products: catalog?.data?.map(mapCatalogProductToCard) ?? [],
        meta: catalog?.meta,
      };
    },

    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}


