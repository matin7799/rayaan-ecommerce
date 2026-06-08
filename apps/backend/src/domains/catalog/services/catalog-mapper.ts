import { Product } from '../entities/product.entity';
import { Media } from '../../media/entities/media.entity';
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
  ProductMediaItemDto,
} from '../dto/product-response.dto';
import { PriceBreakdown } from '../interfaces/pricing.interface';

export function sortMedia(media: Media[]): Media[] {
  return [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function pickThumbnail(media: Media[]): Media | null {
  if (!media.length) {
    return null;
  }
  const sorted = sortMedia(media);
  return sorted[0] ?? null;
}

export function toMediaItemDto(mediaItem: Media): ProductMediaItemDto {
  return {
    id: mediaItem.id,
    url: mediaItem.url,
    thumbnailUrl: mediaItem.thumbnailUrl ?? undefined,
    type: mediaItem.type,
    alt: mediaItem.alt ?? undefined,
    caption: mediaItem.caption ?? undefined,
    order: mediaItem.order ?? undefined,
  };
}

export function toProductListResponse(
  product: Product,
  media: Media[],
  pricing: PriceBreakdown,
): ProductListResponseDto {
  const thumbnail = pickThumbnail(media);

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    title: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          logo: product.brand.logoUrl ?? undefined,
        }
      : undefined,
    categories:
      product.categories?.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })) ?? [],
    tags:
      product.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: 'color' in tag ? (tag.color as string | undefined) : undefined,
      })) ?? [],
    rating: 0,
    reviewsCount: 0,
    thumbnail: thumbnail ? toMediaItemDto(thumbnail) : null,
    pricing,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toProductDetailResponse(
  product: Product,
  media: Media[],
  pricing: PriceBreakdown,
): ProductDetailResponseDto {
  const sortedMedia = sortMedia(media);
  const thumbnail = pickThumbnail(sortedMedia);

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    title: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          logo: product.brand.logoUrl ?? undefined,
        }
      : undefined,
    categories:
      product.categories?.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })) ?? [],
    tags:
      product.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: 'color' in tag ? (tag.color as string | undefined) : undefined,
      })) ?? [],
    pricing,
    media: {
      thumbnail: thumbnail ? toMediaItemDto(thumbnail) : null,
      gallery: sortedMedia.map((item) => toMediaItemDto(item)),
    },
    attributes:
      product.attributes?.map((attribute) => ({
        key: attribute.key,
        value: attribute.value,
      })) ?? [],
    options:
      product.options?.map((option) => ({
        id: option.id,
        optionName: option.option_name,
        priceModifier: Number(option.price_modifier ?? 0),
      })) ?? [],
    variants:
      product.variants?.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        price: Number(variant.price ?? 0),
        comparePrice:
          variant.comparePrice === null || variant.comparePrice === undefined
            ? null
            : Number(variant.comparePrice),
        options:
          variant.options?.map((option) => ({
            name: option.name,
            value: option.value,
          })) ?? [],
        inventory: variant.inventory
          ? {
              stock: variant.inventory.stock,
            }
          : undefined,
      })) ?? [],
    rating: 0,
    reviewsCount: 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
