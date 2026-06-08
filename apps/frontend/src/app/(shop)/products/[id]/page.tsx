import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductTabs } from "@/components/product/product-tabs";
import { RelatedProducts } from "@/components/product/related-products";
import { productService } from "@/services";

async function isTorobAttributionActive(utmSource?: string): Promise<boolean> {
  if (utmSource?.toLowerCase() === "torob") {
    return true;
  }

  const cookieStore = await cookies();
  const until = Number(cookieStore.get("torob_attribution_until")?.value ?? "0");
  return until > 0;
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ utm_source?: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const query = await searchParams;
    const isTorob = await isTorobAttributionActive(query.utm_source);
    const product = await productService.getProductBySlug(
      id,
      isTorob ? 'torob' : undefined,
    );
    
    return {
      title: `${product.title} | فروشگاه`,
      description: product.description || product.title,
    };
  } catch {
    return {
      title: 'محصول یافت نشد',
    };
  }
}

// Server Component
export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ utm_source?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const isTorob = await isTorobAttributionActive(query.utm_source);
  let product;
  
  try {
    product = await productService.getProductBySlug(
      id,
      isTorob ? 'torob' : undefined,
    );
  } catch {
    notFound();
  }

  const stock = Number(product.stockQuantity) || 0;
  const pricingData = (product.pricing ?? {}) as {
    basePrice?: number | string;
    finalPrice?: number | string;
    base_price?: number | string;
    final_price?: number | string;
  };
  const basePrice =
    Number(pricingData.basePrice ?? pricingData.base_price) || 0;
  const finalPrice =
    Number(pricingData.finalPrice ?? pricingData.final_price) || 0;
  
  // Calculate discount percentage
  const discountPercentage = basePrice > 0 && finalPrice > 0 && finalPrice < basePrice
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : undefined;

  // Extract colors from variants (if they have color options)
  const colors: Array<{ id: string; name: string; hex: undefined }> = [];
  const defaultVariant = product.variants?.[0];
  const variantComparePrice =
    Number(defaultVariant?.comparePrice) > 0
      ? Number(defaultVariant?.comparePrice)
      : undefined;
  const variantPrice =
    Number(defaultVariant?.price) > 0 ? Number(defaultVariant?.price) : undefined;
  const hasCatalogDiscount = finalPrice > 0 && basePrice > finalPrice;
  const hasVariantDiscount =
    !!variantPrice && !!variantComparePrice && variantComparePrice > variantPrice;

  const resolvedPrice = hasCatalogDiscount
    ? finalPrice
    : hasVariantDiscount
      ? (variantPrice as number)
      : finalPrice > 0
        ? finalPrice
        : variantPrice ?? basePrice;
  const resolvedOriginalPrice = hasCatalogDiscount
    ? basePrice
    : hasVariantDiscount
      ? variantComparePrice
      : undefined;

  // Map product data to component format
  const mappedProduct = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand?.name || product.categories?.[0]?.name || '',
    shortDescription: product.shortDescription || product.description || '',
    price: resolvedPrice,
    originalPrice: resolvedOriginalPrice,
    discountPercentage,
    debug:
      process.env.NODE_ENV !== 'production'
        ? {
            channel: (isTorob ? 'torob' : 'public') as 'torob' | 'public',
            basePrice,
            finalPrice,
            variantPrice,
            variantComparePrice,
            mappedPrice: resolvedPrice,
            mappedOriginalPrice: resolvedOriginalPrice,
          }
        : undefined,
    rating: product.rating ?? 4.5,
    reviewsCount: product.reviewsCount ?? 0,
    stockStatus: stock,
    images:
      (product.media?.gallery?.map((image) => image.url).filter(Boolean)) ||
      (product.images?.map((image) => image.url).filter(Boolean)) ||
      (product.media?.thumbnail?.url ? [product.media.thumbnail.url] : []) ||
      (product.thumbnailUrl ? [product.thumbnailUrl] : []),
    colors,
    fullDescription: product.description || '',
    specifications: [
      ...(product.attributes?.map((attribute) => ({
        name: attribute.key,
        value: attribute.value,
      })) ?? []),
      ...(product.options?.map((option) => ({
        name: option.optionName,
        value: option.priceModifier.toLocaleString('fa-IR'),
      })) ?? []),
      ...(defaultVariant?.options?.map((option) => ({
        name: option.name,
        value: option.value,
      })) ?? []),
    ],
    reviews: [], // Can be added to backend later
    variants:
      product.variants && product.variants.length > 0
        ? product.variants
        : [
            {
              id: product.id,
              sku: product.slug,
              price: product.pricing?.finalPrice || product.pricing?.basePrice || 0,
            },
          ],
  };

  // Fetch related products (same category)
  let relatedProducts: Array<{
    id: string;
    slug: string;
    title: string;
    brand: string;
    price: number;
    discountPercentage?: number;
    image: string;
    rating: number;
  }> = [];
  
  try {
    if (product.categories && product.categories.length > 0) {
      const categorySlugs = product.categories.map(c => c.slug).join(',');
      const related = await productService.getProducts({
        categories: categorySlugs,
        limit: 5,
      }, isTorob ? 'torob' : undefined);
      
      relatedProducts = related.items
        .filter(p => p.id !== product.id)
        .slice(0, 4)
        .map(p => {
          const relatedDiscount = p.pricing?.basePrice && p.pricing?.finalPrice
            ? Math.round(((p.pricing.basePrice - p.pricing.finalPrice) / p.pricing.basePrice) * 100)
            : undefined;
          
          return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            brand: p.brand?.name || p.categories?.[0]?.name || '',
            price: p.pricing?.finalPrice || p.pricing?.basePrice || 0,
            discountPercentage: relatedDiscount,
            image: p.thumbnailUrl || '',
            rating: p.rating ?? 4.5,
          };
        });
    }
  } catch {
    // Silently fail - related products are optional
    relatedProducts = [];
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
          <a href="/" className="hover:text-primary transition-colors">خانه</a>
          <span>/</span>
          <a href="/products" className="hover:text-primary transition-colors">محصولات</a>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[200px]">{mappedProduct.title}</span>
        </nav>

        {/* Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14 mb-14">
          <section>
            <ProductGallery images={mappedProduct.images} />
          </section>
          <section>
            <ProductInfo product={mappedProduct} />
          </section>
        </div>

        {/* Tabs */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-10">
          <ProductTabs product={mappedProduct} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <RelatedProducts products={relatedProducts} title="پیشنهادهای مشابه" />
          </div>
        )}

      </div>
    </div>
  );
}
