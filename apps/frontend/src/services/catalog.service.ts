import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface CatalogFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  tag?: string;
  sort?: 'name' | 'basePrice' | 'createdAt' | 'viewCount';
  categorySlugs?: string[];
  brandSlugs?: string[];
  tagSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'basePrice' | 'createdAt' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PriceBreakdown {
  basePrice: number;
  finalPrice: number;
  salePrice?: number | null;
  sale_price?: number | null;
  isOnSale?: boolean;
  is_on_sale?: boolean;
  discounts: Array<{
    type: 'SALE' | 'PARTNER' | 'CAMPAIGN' | 'TOROB';
    amount: number;
    percent?: number;
  }>;
  savings: number;
  savingsPercent: number;
}

export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  children?: CatalogCategory[];
}

export interface CatalogTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: {
    url: string;
    alt?: string;
  };
  images?: Array<string | { url: string; alt?: string }>;
  media?: {
    thumbnail?: { url: string; alt?: string } | null;
    gallery?: Array<{ url: string; alt?: string; order?: number }>;
  };
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  brand?: CatalogBrand;
  categories?: CatalogCategory[];
  tags?: CatalogTag[];
  variants?: Array<{
    id: string;
    sku: string;
    price: number;
  }>;
  pricing: PriceBreakdown;
  createdAt: string;
  updatedAt: string;
  title: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  isBestSeller?: boolean;
  inStock?: boolean;
  isNew?: boolean;
  specs?: { label: string; value: string }[];
  shortDescription?: string;
  defaultVariantId?: string;
  hasMultipleVariants?: boolean;
}

export interface CatalogResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const buildCatalogParams = (filters: CatalogFilters): URLSearchParams => {
  const params = new URLSearchParams();
  const normalized = { ...filters };

  if (normalized.category && !normalized.categorySlugs?.length) {
    normalized.categorySlugs = [normalized.category];
  }
  if (normalized.brand && !normalized.brandSlugs?.length) {
    normalized.brandSlugs = [normalized.brand];
  }
  if (normalized.tag && !normalized.tagSlugs?.length) {
    normalized.tagSlugs = [normalized.tag];
  }
  if (normalized.sort && !normalized.sortBy) {
    normalized.sortBy = normalized.sort;
  }

  Object.entries(normalized).forEach(([key, value]) => {
    if (value === undefined || value === null || ['category', 'brand', 'tag', 'sort'].includes(key)) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else {
      params.append(key, String(value));
    }
  });

  return params;
};

export async function getCatalogProducts(filters: CatalogFilters = {}): Promise<CatalogResponse> {
  const params = buildCatalogParams(filters);
  const queryString = params.toString();
  const endpoint = queryString ? `/catalog/products?${queryString}` : '/catalog/products';

  const response = await apiClient.get<CatalogResponse>(endpoint);
  return response.data;
}

export async function getCatalogTableProducts(
  filters: CatalogFilters = {},
): Promise<CatalogResponse> {
  const tableFilters: CatalogFilters = { ...filters };
  delete tableFilters.page;
  delete tableFilters.limit;

  const params = buildCatalogParams(tableFilters);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/catalog/products/table?${queryString}`
    : '/catalog/products/table';

  const response = await apiClient.get<CatalogResponse>(endpoint);
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/catalog/products/${id}`);
  return response.data;
}

export async function getBrands(): Promise<CatalogBrand[]> {
  const response = await apiClient.get<any>('/brands');
  const payload = response.data;
  if (Array.isArray(payload)) {
    return 'slug' in (payload[0] ?? {}) ? payload : (payload[0]?.data ?? []);
  }
  return payload?.data ?? [];
}

export async function getCategories(): Promise<CatalogCategory[]> {
  const response = await apiClient.get<any>('/categories');
  const payload = response.data;
  if (Array.isArray(payload)) {
    return 'slug' in (payload[0] ?? {}) ? payload : (payload[0]?.data ?? []);
  }
  return payload?.data ?? [];
}

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
  const response = await apiClient.patch<{ success: boolean; data: Product }>(
    API_ENDPOINTS.PRODUCTS.ADMIN_UPDATE(id),
    payload,
  );
  return response.data.data;
}
