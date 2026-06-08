import type { CatalogFilters, Product } from '@/services/catalog.service';

export const catalogTableConfig = {
  enableSubcategoryFilter: true,
} as const;

export type CatalogTableSortField =
  | 'basePrice'
  | 'createdAt'
  | 'name'
  | 'viewCount'
  | 'stockQuantity';

export type CatalogTableSortOrder = 'ASC' | 'DESC';

export interface CatalogTableQueryState {
  categorySlugs: string[];
  brandSlugs: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: CatalogTableSortField;
  sortOrder?: CatalogTableSortOrder;
  page: number;
  limit: number;
}

export interface CatalogTableRow {
  id: string;
  sku: string;
  slug: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  mainCategory: string;
  subcategory?: string;
  brand: string;
  basePrice: number;
  finalPrice?: number;
  collaboratorPrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogTableResult {
  rows: CatalogTableRow[];
  rawItems: Product[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export type CatalogTableApiFilters = CatalogFilters & {
  category?: string;
};
