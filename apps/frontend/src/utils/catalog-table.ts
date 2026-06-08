import type {
  CatalogFilters,
  CatalogResponse,
  Product,
} from '@/services/catalog.service';
import type {
  CatalogTableApiFilters,
  CatalogTableQueryState,
  CatalogTableResult,
  CatalogTableRow,
} from '@/types/catalog-table';

const PLACEHOLDER_IMAGE =
  'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';

const resolveImageUrl = (
  image?: string | { url: string; alt?: string },
): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'string') return image.trim() || undefined;
  return image.url?.trim() || undefined;
};

const toPositiveNumber = (value: string | null, fallback?: number): number | undefined => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export function parseCatalogTableSearchParams(
  searchParams: URLSearchParams,
): CatalogTableQueryState {
  const legacyCategory = searchParams.get('category');
  const legacySubcategory = searchParams.get('subcategory');
  const categorySlugs = [
    ...searchParams.getAll('category'),
    ...searchParams.getAll('categorySlugs'),
    ...(legacyCategory ? [legacyCategory] : []),
    ...(legacySubcategory ? [legacySubcategory] : []),
  ].filter(Boolean);

  return {
    categorySlugs: Array.from(new Set(categorySlugs)),
    brandSlugs: searchParams.getAll('brand'),
    search: searchParams.get('search') || undefined,
    minPrice: toPositiveNumber(searchParams.get('minPrice')),
    maxPrice: toPositiveNumber(searchParams.get('maxPrice')),
    sortBy:
      (searchParams.get('sortBy') as CatalogTableQueryState['sortBy'] | null) ??
      'createdAt',
    sortOrder:
      (searchParams.get('sortOrder') as CatalogTableQueryState['sortOrder'] | null) ??
      'DESC',
    page: toPositiveNumber(searchParams.get('page'), 1) ?? 1,
    limit: toPositiveNumber(searchParams.get('limit'), 20) ?? 20,
  };
}

export function buildCatalogTableFilters(
  state: CatalogTableQueryState,
  _enableSubcategoryFilter: boolean,
): CatalogTableApiFilters {
  const resolvedSortBy =
    state.sortBy === 'stockQuantity' ? 'createdAt' : state.sortBy;

  return {
    page: state.page,
    limit: state.limit,
    search: state.search,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sortBy: resolvedSortBy,
    sortOrder: state.sortOrder,
    categorySlugs: state.categorySlugs.length > 0 ? state.categorySlugs : undefined,
    brandSlugs: state.brandSlugs.length > 0 ? state.brandSlugs : undefined,
  };
}

const getMainAndSubCategory = (product: Product): { mainCategory: string; subcategory?: string } => {
  const categories = product.categories ?? [];
  if (categories.length === 0) {
    return { mainCategory: 'بدون دسته‌بندی' };
  }

  const main = categories.find((category) => !category.parentId) ?? categories[0];
  const sub = categories.find((category) => category.parentId === main.id);

  return {
    mainCategory: main.name,
    subcategory: sub?.name,
  };
};

const getCollaboratorPrice = (product: Product): number | undefined => {
  const toPositiveNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number') return value > 0 ? value : undefined;
    if (typeof value === 'string') {
      const normalized = value.replace(/,/g, '').trim();
      if (!normalized) return undefined;
      const parsed = Number(normalized);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
    return undefined;
  };

  const directSalePrice =
    toPositiveNumber((product as Product & { salePrice?: unknown }).salePrice) ??
    toPositiveNumber((product as Product & { sale_price?: unknown }).sale_price) ??
    toPositiveNumber(product.pricing.salePrice) ??
    toPositiveNumber(product.pricing.sale_price);

  if (typeof directSalePrice === 'number') {
    return directSalePrice;
  }

  const hasSaleDiscount = product.pricing.discounts.some(
    (discount) => discount.type === 'SALE',
  );
  if (
    hasSaleDiscount &&
    product.pricing.finalPrice > 0 &&
    product.pricing.finalPrice < product.pricing.basePrice
  ) {
    return product.pricing.finalPrice;
  }

  return undefined;
};

export function mapCatalogProductToTableRow(product: Product): CatalogTableRow {
  const mediaThumbnailUrl = product.media?.thumbnail?.url?.trim();
  const mediaFirstGalleryUrl = product.media?.gallery?.[0]?.url?.trim();
  const imageUrl =
    product.thumbnail?.url?.trim() ||
    mediaThumbnailUrl ||
    mediaFirstGalleryUrl ||
    resolveImageUrl(product.images?.[0]) ||
    PLACEHOLDER_IMAGE;
  const { mainCategory, subcategory } = getMainAndSubCategory(product);
  const isInStock = product.stockQuantity > 0;

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    title: product.name,
    imageUrl,
    imageAlt: product.thumbnail?.alt || product.media?.thumbnail?.alt || product.name,
    mainCategory,
    subcategory,
    brand: product.brand?.name || 'بدون برند',
    basePrice: product.pricing.basePrice,
    finalPrice:
      product.pricing.finalPrice < product.pricing.basePrice
        ? product.pricing.finalPrice
        : undefined,
    collaboratorPrice: getCollaboratorPrice(product),
    stockQuantity: product.stockQuantity,
    isInStock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function mapCatalogTableResult(data: CatalogResponse): CatalogTableResult {
  const resolved = toCatalogResponse(data);
  const rows = resolved.data
    .map(mapCatalogProductToTableRow)
    .sort((left, right) => Number(left.isInStock) - Number(right.isInStock));

  return {
    rows,
    rawItems: resolved.data,
    meta: {
      currentPage: resolved.meta.page,
      totalPages: resolved.meta.totalPages,
      totalItems: resolved.meta.total,
      itemsPerPage: resolved.meta.limit,
    },
  };
}

function toCatalogResponse(payload: unknown): CatalogResponse {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    'meta' in payload &&
    Array.isArray((payload as CatalogResponse).data)
  ) {
    return payload as CatalogResponse;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (
      nested &&
      typeof nested === 'object' &&
      'data' in nested &&
      'meta' in nested &&
      Array.isArray((nested as CatalogResponse).data)
    ) {
      return nested as CatalogResponse;
    }
  }

  if (Array.isArray(payload) && payload.length > 0) {
    return toCatalogResponse(payload[0]);
  }

  return {
    data: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  };
}
