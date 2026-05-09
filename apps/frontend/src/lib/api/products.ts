import { productService, ProductsQueryParams, PaginatedResponse, ProductListItem } from '@/services';

export interface GetProductsParams {
  category?: string;
  categorySlug?: string;
  categorySlugs?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'createdAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

export async function getProducts(params?: GetProductsParams): Promise<PaginatedResponse<ProductListItem>> {
  const queryParams: ProductsQueryParams = {
    page: params?.page || 1,
    limit: params?.limit || 20,
    category: params?.category || params?.categorySlug,
    categorySlugs: params?.categorySlugs,
    minPrice: params?.minPrice,
    maxPrice: params?.maxPrice,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  };

  return await productService.getProducts(queryParams);
}

export async function getProductBySlug(slug: string) {
  return await productService.getProductBySlug(slug);
}

export async function getCategories() {
  return await productService.getCategories();
}
