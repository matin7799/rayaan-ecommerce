import type {
  CatalogFilters,
  CatalogResponse,
  Product,
} from '@/services/api/catalog.service';
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
  return {
    category: searchParams.get('category') || undefined,
    subcategory: searchParams.get('subcategory') || undefined,
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
  enableSubcategoryFilter: boolean,
): CatalogTableApiFilters {
  const resolvedSortBy =
    state.sortBy === 'stockQuantity' ? 'createdAt' : state.sortBy;

  const categorySlugs = [
    state.category,
    enableSubcategoryFilter ? state.subcategory : undefined,
  ].filter(Boolean) as string[];

  return {
    page: state.page,
    limit: state.limit,
    search: state.search,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sortBy: resolvedSortBy,
    sortOrder: state.sortOrder,
    category: state.category,
    categorySlugs: categorySlugs.length > 0 ? categorySlugs : undefined,
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
  const partnerDiscount = product.pricing.discounts.find(
    (discount) => discount.type === 'PARTNER',
  );

  if (!partnerDiscount) {
    return undefined;
  }

  if (partnerDiscount.percent && partnerDiscount.percent > 0) {
    return Math.max(
      0,
      Math.round(product.pricing.basePrice * (1 - partnerDiscount.percent / 100)),
    );
  }

  if (partnerDiscount.amount && partnerDiscount.amount > 0) {
    return Math.max(0, product.pricing.basePrice - partnerDiscount.amount);
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
    isInStock: product.stockQuantity > 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function mapCatalogTableResult(data: CatalogResponse): CatalogTableResult {
  const resolved = toCatalogResponse(data);

  return {
    rows: resolved.data.map(mapCatalogProductToTableRow),
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
