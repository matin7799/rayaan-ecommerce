// utils/catalog.ts

import type {
  CatalogBrand,
  CatalogCategory,
  CatalogFilters,
  Product as CatalogApiProduct,
} from '@/services/catalog.service';
import type { Brand } from '@/types/brand';
import { ProductCardItem } from '@/types/catalog.types';
import type { Category } from '@/types/category';


export type CatalogListItem = ProductCardItem;

export interface CatalogQueryState {
  search?: string;
  categorySlugs: string[];
  brandSlugs: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  sortBy?: CatalogFilters['sortBy'];
  sortOrder?: CatalogFilters['sortOrder'];
  page?: number;
  limit?: number;
}

const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';

const resolveImageUrl = (
  image?: string | { url: string; alt?: string },
): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'string') return image.trim() || undefined;
  return image.url?.trim() || undefined;
};

const resolveImageAlt = (
  image?: string | { url: string; alt?: string },
): string | undefined => {
  if (!image || typeof image === 'string') return undefined;
  return image.alt ?? undefined;
};

export function mapCatalogProductToCard(product: CatalogApiProduct): CatalogListItem {
  const saleDiscount = product.pricing.discounts.find((discount) => discount.type === 'SALE');
  const partnerDiscount = product.pricing.discounts.find((discount) => discount.type === 'PARTNER');
  const thumbnailUrl = product.thumbnail?.url?.trim() || product.media?.thumbnail?.url?.trim();
  const firstImageUrl = resolveImageUrl(product.images?.[0]) || product.media?.gallery?.[0]?.url?.trim();

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brand: product.brand?.name || product.categories?.[0]?.name || 'بدون برند',

    thumbnail: thumbnailUrl || firstImageUrl || PLACEHOLDER_IMAGE,
    thumbnailAlt:
      product.thumbnail?.alt ??
      product.media?.thumbnail?.alt ??
      resolveImageAlt(product.images?.[0]) ??
      product.name,

    price: product.pricing.basePrice,
    discountPrice:
      product.pricing.finalPrice < product.pricing.basePrice
        ? product.pricing.finalPrice
        : undefined,

    badge: partnerDiscount ? 'همکار' : saleDiscount ? 'حراج' : undefined,
    inStock: product.stockQuantity > 0,

    rating: 0,
    reviewsCount: 0,
    isBestSeller: false,
    isNew: false,
    shortDescription: product.shortDescription ?? '',
    specs: [],
    defaultVariantId:
      product.variants && product.variants.length > 0 ? product.variants[0].id : undefined,
    hasMultipleVariants: (product.variants?.length ?? 0) > 1,
  };
}

export function mapCatalogBrandToLegacyBrand(brand: CatalogBrand): Brand {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: null,
    logoUrl: brand.logoUrl ?? null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };
}

export function mapCatalogCategoryToLegacyCategory(category: CatalogCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: null,
    isActive: true,
    parentId: null,
    children: [],
    createdAt: '',
    updatedAt: '',
  };
}

export function parseCatalogSearchParams(searchParams: URLSearchParams): CatalogQueryState {
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') as CatalogFilters['sortBy'] | null;
  const sortOrder = searchParams.get('sortOrder') as CatalogFilters['sortOrder'] | null;
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  return {
    search: searchParams.get('search') || undefined,
    brandSlugs: searchParams.getAll('brandSlugs'),
    categorySlugs: searchParams.getAll('categorySlugs'),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    isOnSale: searchParams.get('isOnSale') === 'true' ? true : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  };
}

export function buildCatalogFilters(state: CatalogQueryState): CatalogFilters {
  return {
    page: state.page,
    limit: state.limit,
    search: state.search,
    categorySlugs:
      state.categorySlugs && state.categorySlugs.length > 0 ? state.categorySlugs : undefined,
    brandSlugs: state.brandSlugs && state.brandSlugs.length > 0 ? state.brandSlugs : undefined,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    inStock: state.inStock,
    isOnSale: state.isOnSale,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  };
}
