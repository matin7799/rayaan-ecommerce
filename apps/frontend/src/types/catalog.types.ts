// types/catalog.ts

// === Category Types ===
export interface Category {
  id: string;
  name: string;
  slug: string;
  children: Category[];
}

// === Shared Catalog / Product Types ===
export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductOption {
  id: string;
  name: string;
  value: string;
  extraPrice: number;
}

export interface ProductCardItem {
  id: string;
  slug: string;
  title: string;
  brand: string;
  thumbnail: string;
  thumbnailAlt: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  isBestSeller?: boolean;
  inStock: boolean;
  isNew?: boolean;
  specs?: { label: string; value: string }[];
  shortDescription?: string;
  defaultVariantId?: string;
  hasMultipleVariants?: boolean;
}

// === Product List Item (legacy/simple list usage) ===
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// === Product Detail ===
export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  attributes: ProductAttribute[];
  options: ProductOption[];
}

// === Pagination ===
export interface PaginationMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// === Query Params برای لیست محصولات ===
export type ProductSortOption = 'price_asc' | 'price_desc' | 'newest';

export interface ProductsQueryParams {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: ProductSortOption;
}
