import { Product } from '../entities/product.entity';
import { TorobProductDto } from '../dto/torob-feed.dto';
import { Media } from '../../media/entities/media.entity';

interface ProductAttributeLike {
  key?: string;
  value?: string | number | boolean | null;
}

interface ProductOptionLike {
  option_name?: string;
  price_modifier?: number | null;
}

export function mapProductToTorobDto(
  product: Product & {
    attributes?: ProductAttributeLike[];
    options?: ProductOptionLike[];
    guarantee?: string | null;
  },
  mediaItems: Media[],
  frontendBaseUrl: string,
): TorobProductDto {
  const basePrice = Math.max(0, Math.round(Number(product.basePrice ?? 0)));
  const salePriceRaw = product.salePrice;
  const hasSalePrice = salePriceRaw !== null && salePriceRaw !== undefined;
  const salePrice = hasSalePrice
    ? Math.max(0, Math.round(Number(salePriceRaw)))
    : undefined;

  // Torob feed always prefers sale_price when available.
  const currentPrice = salePrice ?? basePrice;
  const oldPrice =
    salePrice !== undefined && basePrice > salePrice ? basePrice : undefined;

  const isAvailable =
    !product.trackInventory || (product.stockQuantity ?? 0) > 0;

  const spec: Record<string, string | number | boolean> = {};

  product.attributes?.forEach((attr) => {
    const key = attr.key?.trim();
    if (key && attr.value !== undefined && attr.value !== null) {
      spec[key] = attr.value;
    }
  });

  product.options?.forEach((option) => {
    const key = option.option_name?.trim();
    if (
      key &&
      option.price_modifier !== undefined &&
      option.price_modifier !== null
    ) {
      spec[key] = option.price_modifier;
    }
  });

  const imageLinks = mediaItems
    .map((media) => media.thumbnailUrl || media.url)
    .filter((url): url is string => Boolean(url));

  const guarantee = product.guarantee?.trim() || 'گارانتی اصالت و سلامت فیزیکی';

  return {
    page_unique: product.id,
    page_url: `${frontendBaseUrl}/products/${product.slug}`,
    title: product.name,
    current_price: currentPrice,
    old_price: oldPrice,
    availability: isAvailable ? 'instock' : 'outofstock',
    image_links: imageLinks,
    date_added: product.createdAt.toISOString(),
    date_updated: product.updatedAt?.toISOString(),
    product_group_id: product.id,
    category_name: product.categories?.[0]?.name,
    short_desc: product.description ?? undefined,
    spec: Object.keys(spec).length > 0 ? spec : undefined,
    guarantee,
  };
}
