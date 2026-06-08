export type CatalogSortBy = 'createdAt' | 'basePrice' | 'name';
export type CatalogSortOrder = 'ASC' | 'DESC';

export interface CatalogBreadcrumbItem {
  label: string;
  href?: string;
}

export interface CatalogHeroData {
  title: string;
  description?: string;
  coverImage?: string;
  productCount?: number;
  brandCount?: number;
  badges?: string[];
  breadcrumbs?: CatalogBreadcrumbItem[];
}

export interface CatalogSubcategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
  href?: string;
}

export interface CatalogToolbarState {
  sortBy?: CatalogSortBy;
  sortOrder?: CatalogSortOrder;
  total?: number;
  activeFiltersCount?: number;
}
