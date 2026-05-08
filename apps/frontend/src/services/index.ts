export { authService } from './auth.service';
export { blogService } from './blog.service';
export { userService } from './user.service';
export { productService } from './product.service';
export { fetchProductById, fetchProducts } from './catalog.service';

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
} from './product.service';

export type {
  CatalogBrand,
  CatalogCategory,
  CatalogFilters,
  CatalogResponse,
  CatalogTag,
  PriceBreakdown,
  Product,
} from './catalog.service';
