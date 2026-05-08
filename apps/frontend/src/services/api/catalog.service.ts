import { apiClient } from '../api-client';

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
  discounts: Array<{
    type: 'SALE' | 'PARTNER';
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

type CatalogMediaItem = {
  url: string;
  name?: string | null;
  alt?: string | null;
  mimeType?: string | null;
};

type CatalogApiProduct = {
  id: string;
  slug: string;
  title: string;
  brand?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  inStock?: boolean;
  thumbnail?: CatalogMediaItem | null;
  images?: CatalogMediaItem[];
  media?: {
    thumbnail?: CatalogMediaItem | null;
    gallery?: CatalogMediaItem[];
  };
  badge?: string | null;
};


const appendFilterValue = (
  params: URLSearchParams,
  key: string,
  value: string | number | boolean,
): void => {
  params.append(key, String(value));
};

const buildCatalogParams = (filters: CatalogFilters): URLSearchParams => {
  const params = new URLSearchParams();
  const normalizedFilters: CatalogFilters = { ...filters };

  if (
    normalizedFilters.category &&
    (!normalizedFilters.categorySlugs || normalizedFilters.categorySlugs.length === 0)
  ) {
    normalizedFilters.categorySlugs = [normalizedFilters.category];
  }

  if (
    normalizedFilters.brand &&
    (!normalizedFilters.brandSlugs || normalizedFilters.brandSlugs.length === 0)
  ) {
    normalizedFilters.brandSlugs = [normalizedFilters.brand];
  }

  if (
    normalizedFilters.tag &&
    (!normalizedFilters.tagSlugs || normalizedFilters.tagSlugs.length === 0)
  ) {
    normalizedFilters.tagSlugs = [normalizedFilters.tag];
  }

  if (normalizedFilters.sort && !normalizedFilters.sortBy) {
    normalizedFilters.sortBy = normalizedFilters.sort;
  }

  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === 'category' || key === 'brand' || key === 'tag' || key === 'sort') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => appendFilterValue(params, key, item));
      return;
    }

    appendFilterValue(params, key, value);
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

export async function getProduct(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/catalog/products/${id}`);
  return response.data;
}

type BrandsWrappedResponse =
  | CatalogBrand[]
  | { success: boolean; data: CatalogBrand[] }
  | Array<{ success: boolean; data: CatalogBrand[] }>;

export async function getBrands(): Promise<CatalogBrand[]> {
  const response = await apiClient.get<BrandsWrappedResponse>('/brands');
  const payload = response.data;

  // حالت 1: مستقیم آرایه برندها
  if (Array.isArray(payload) && payload.length > 0 && 'slug' in payload[0]) {
    return payload as CatalogBrand[];
  }

  // حالت 2: آرایه‌ای شامل wrapper
  if (Array.isArray(payload) && payload.length > 0 && 'data' in payload[0]) {
    return payload[0].data ?? [];
  }

  // حالت 3: wrapper عادی
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? [];
  }

  return [];
}

type CategoriesWrappedResponse =
  | CatalogCategory[]
  | { success: boolean; data: CatalogCategory[] }
  | Array<{ success: boolean; data: CatalogCategory[] }>;

export async function getCategories(): Promise<CatalogCategory[]> {
  const response = await apiClient.get<CategoriesWrappedResponse>('/categories');
  const payload = response.data;

  if (Array.isArray(payload) && payload.length > 0 && 'slug' in payload[0]) {
    return payload as CatalogCategory[];
  }

  if (Array.isArray(payload) && payload.length > 0 && 'data' in payload[0]) {
    return payload[0].data ?? [];
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? [];
  }

  return [];
}
