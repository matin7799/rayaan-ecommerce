import {
  CatalogFilters,
  CatalogResponse,
  getCatalogProducts,
  getProduct,
  Product,
} from './api/catalog.service';

export type {
  CatalogBrand,
  CatalogCategory,
  CatalogFilters,
  CatalogResponse,
  CatalogTag,
  PriceBreakdown,
  Product,
} from './api/catalog.service';

export async function fetchProducts(
  params: CatalogFilters = {},
): Promise<CatalogResponse> {
  return getCatalogProducts(params);
}

export async function fetchProductById(id: string): Promise<Product> {
  return getProduct(id);
}

export async function updateProductByAdmin(
  id: string,
  payload: Partial<{
    name: string;
    sku: string;
    base_price: number;
    stock_quantity: number;
    short_description: string;
    is_active: boolean;
    is_featured: boolean;
  }>,
): Promise<Product> {
  const { apiClient } = await import('./api-client');
  const { API_ENDPOINTS } = await import('@/lib/api/endpoints');
  const response = await apiClient.patch<{ success: boolean; data: Product }>(
    API_ENDPOINTS.PRODUCTS.ADMIN_UPDATE(id),
    payload,
  );
  return response.data.data;
}
