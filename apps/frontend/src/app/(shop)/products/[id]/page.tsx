import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductTabs } from "@/components/product/product-tabs";
import { RelatedProducts } from "@/components/product/related-products";
import { productService } from "@/services";

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const product = await productService.getProductBySlug(id);
    
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
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  
  try {
    product = await productService.getProductBySlug(id);
  } catch {
    notFound();
  }

  const stock = product.stockQuantity || 0;
  
  // Calculate discount percentage
  const discountPercentage = product.pricing?.basePrice && product.pricing?.finalPrice
    ? Math.round(((product.pricing.basePrice - product.pricing.finalPrice) / product.pricing.basePrice) * 100)
    : undefined;

  // Extract colors from variants (if they have color options)
  const colors: Array<{ id: string; name: string; hex: undefined }> = [];
  const defaultVariant = product.variants?.[0];

  // Map product data to component format
  const mappedProduct = {
    id: product.id,
    title: product.title,
    brand: product.brand?.name || product.categories?.[0]?.name || '',
    shortDescription: product.shortDescription || product.description || '',
    price: product.pricing?.finalPrice || product.pricing?.basePrice || 0,
    originalPrice:
      product.pricing?.finalPrice && product.pricing?.basePrice > product.pricing?.finalPrice
        ? product.pricing.basePrice
        : undefined,
    discountPercentage,
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
      });
      
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
    <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Product Gallery and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-16">
        
        {/* Gallery */}
        <section className="relative">
          <ProductGallery images={mappedProduct.images} />
        </section>

        {/* Product Info */}
        <section className="relative">
          <div className="absolute -inset-4 bg-linear-to-br from-primary/5 via-transparent to-transparent rounded-3xl -z-10 blur-2xl"></div>
          <ProductInfo product={mappedProduct} />
        </section>
        
      </div>

      {/* Product Tabs */}
      <ProductTabs product={mappedProduct} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} title="پیشنهادهای مشابه" />
      )}

    </main>
  );
}
