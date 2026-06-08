export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  children?: Category[];
}

export interface ProductVariantOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stock?: number;
  options: ProductVariantOption[];
  inventory?: {
    stock: number;
  };
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductOption {
  id: string;
  optionName: string;
  priceModifier: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  brandId?: string;
  brand?: Brand;
  categories: Category[];
  variants: ProductVariant[];
  attributes?: ProductAttribute[];
  options?: ProductOption[];
  tags?: Tag[];
  images?: ProductImage[];
  thumbnailUrl?: string | null;
  media?: {
    thumbnail?: ProductImage | null;
    gallery?: ProductImage[];
  };
  pricing?: {
    basePrice: number;
    finalPrice: number;
  };
  stockQuantity?: number;
  isUnavailable?: boolean;
  rating?: number;
  reviewsCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ProductDetail = ProductListItem;

export interface ProductsQueryParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  categories?: string;
  category?: string;
  categorySlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'createdAt' | 'title' | 'basePrice' | 'name';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogTag = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogMediaItem = {
  url: string;
  alt?: string | null;
  order?: number;
};

export type CatalogListItem = {
  id: string;
  name: string;
  title?: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  isActive: boolean;
  stockQuantity?: number;
  brand?: CatalogBrand;
  categories?: CatalogCategory[];
  tags?: CatalogTag[];
  thumbnail?: CatalogMediaItem | null;
  pricing?: {
    basePrice: number;
    finalPrice: number;
  };
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  reviewsCount?: number;
};

export type CatalogDetailItem = CatalogListItem & {
  media?: {
    thumbnail?: CatalogMediaItem | null;
    gallery?: CatalogMediaItem[];
  };
  attributes?: ProductAttribute[];
  options?: ProductOption[];
  variants?: ProductVariant[];
};

export type CatalogResponse = {
  data: CatalogListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CatalogDetailResponse = CatalogDetailItem;

export const mapCatalogBrand = (brand?: CatalogBrand): Brand | undefined => {
  if (!brand) return undefined;

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logo ?? null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };
};

export const mapCatalogCategory = (category: CatalogCategory): Category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  isActive: true,
  children: [],
});

export const mapCatalogTag = (tag: CatalogTag): Tag => ({
  id: tag.id,
  name: tag.name,
  slug: tag.slug,
  isActive: true,
  createdAt: '',
  updatedAt: '',
});

export const mapCatalogItemToProductListItem = (
  item: CatalogListItem | CatalogDetailItem,
): ProductListItem => {
  const inStock = Number(item.stockQuantity ?? 0) > 0;
  const detailMedia = 'media' in item ? item.media : undefined;
  const detailVariants = 'variants' in item ? item.variants : undefined;
  const detailAttributes = 'attributes' in item ? item.attributes : undefined;
  const detailOptions = 'options' in item ? item.options : undefined;
  const mediaGallery = detailMedia?.gallery ?? [];
  const thumbnailUrl = item.thumbnail?.url ?? detailMedia?.thumbnail?.url ?? null;
  const mappedGallery = mediaGallery.map((media, index) => ({
    url: media.url,
    alt: media.alt ?? undefined,
    order: media.order ?? index,
  }));
  const mappedThumbnail = detailMedia?.thumbnail
    ? {
        url: detailMedia.thumbnail.url,
        alt: detailMedia.thumbnail.alt ?? undefined,
        order: detailMedia.thumbnail.order ?? 0,
      }
    : null;

  return {
    id: item.id,
    title: item.title ?? item.name,
    slug: item.slug,
    description: item.description,
    shortDescription: item.shortDescription,
    brandId: item.brand?.id,
    brand: mapCatalogBrand(item.brand),
    categories: (item.categories ?? []).map(mapCatalogCategory),
    variants: detailVariants ?? [],
    attributes: detailAttributes ?? [],
    options: detailOptions ?? [],
    tags: (item.tags ?? []).map(mapCatalogTag),
    images: mappedGallery,
    thumbnailUrl,
    media: {
      thumbnail: mappedThumbnail,
      gallery: mappedGallery,
    },
    pricing: item.pricing,
    stockQuantity: item.stockQuantity,
    isUnavailable: !inStock,
    rating: item.rating ?? 0,
    reviewsCount: item.reviewsCount ?? 0,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const normalizeProductsParams = (params: ProductsQueryParams): Record<string, unknown> => {
  const normalized: Record<string, unknown> = { ...params };

  if (params.categories && !params.category && !params.categorySlugs?.length) {
    normalized.categorySlugs = params.categories
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean);
  }

  if (params.category && !params.categorySlugs?.length) {
    normalized.categorySlugs = [params.category];
  }

  if (params.sortBy === 'price') {
    normalized.sortBy = 'basePrice';
  }

  if (params.sortBy === 'title') {
    normalized.sortBy = 'name';
  }

  delete normalized.categories;
  delete normalized.category;

  return normalized;
};
