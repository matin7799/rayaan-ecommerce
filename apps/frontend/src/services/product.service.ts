import { apiClient } from './api-client';
import { API_ENDPOINTS, buildQueryString } from '@/lib/api/endpoints';

import {
  type Category,
  type ProductVariantOption,
  type ProductVariant,
  type ProductImage,
  type Brand,
  type Tag,
  type ProductListItem,
  type ProductsQueryParams,
  type PaginatedResponse,
  type ApiResponse,
  type CatalogResponse,
  type CatalogDetailResponse,
  type ProductDetail,
  normalizeProductsParams,
  mapCatalogItemToProductListItem,
} from './product-mapper';

export type {
  Category,
  ProductVariantOption,
  ProductVariant,
  ProductImage,
  Brand,
  Tag,
  ProductListItem,
  ProductDetail,
  ProductsQueryParams,
  PaginatedResponse,
  ApiResponse,
};



export const productService = {
  getProducts: async (
    params: ProductsQueryParams = {},
    attributionSource?: 'torob',
  ): Promise<PaginatedResponse<ProductListItem>> => {
    const normalizedParams = normalizeProductsParams(params);
    const queryString = buildQueryString(normalizedParams);
    const { data } = await apiClient.get<ApiResponse<CatalogResponse>>(
      `${API_ENDPOINTS.PRODUCTS.LIST}${queryString}`,
      attributionSource
        ? {
            headers: {
              'X-Attribution-Source': attributionSource,
            },
          }
        : undefined,
    );
    const catalog = data.data;

    return {
      items: (catalog.data ?? []).map(mapCatalogItemToProductListItem),
      meta: catalog.meta,
    };
  },

  getProductBySlug: async (
    slug: string,
    attributionSource?: 'torob',
  ): Promise<ProductDetail> => {
    const { data } = await apiClient.get<ApiResponse<CatalogDetailResponse>>(
      API_ENDPOINTS.PRODUCTS.DETAIL(slug),
      attributionSource
        ? {
            headers: {
              'X-Attribution-Source': attributionSource,
            },
          }
        : undefined,
    );
    return mapCatalogItemToProductListItem(data.data);
  },

getCategories: async (): Promise<Category[]> => {
  const { data } = await apiClient.get<ApiResponse<{ message: string; data: Category[] }>>(
    API_ENDPOINTS.CATEGORIES.LIST,
  );
  // حالا به data.data دسترسی داریم
  return data.data.data;
},


  getCategoryById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORIES.DETAIL(id),
    );
    return data.data;
  },
};
