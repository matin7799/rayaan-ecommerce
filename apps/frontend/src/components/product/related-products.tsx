'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// تایپ فرضی محصولات مرتبط
interface RelatedProduct {
  slug: string;
  id: string;
  title: string;
  brand: string;
  price: number;
  discountPercentage?: number;
  image: string;
  rating: number;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  title?: string;
}

export function RelatedProducts({ products, title = 'محصولات مشابه' }: RelatedProductsProps) {
  const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';
  // محاسبه قیمت با تخفیف
  const calculateDiscount = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  return (
    <section className="w-full mt-16 md:mt-32 mb-16">
      {/* هدر بخش */}
      <div className="flex items-center justify-between mb-8 px-2 md:px-0">
        <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3">
          <span className="w-3 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"></span>
          {title}
        </h3>
        <Link
          href="/products"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          مشاهده همه
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* اسلایدر افقی با Scroll Snap */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 px-2 md:px-0 -mx-2 md:mx-0 scrollbar-hide">
        {products.map((product) => {
          const finalPrice = product.discountPercentage
            ? calculateDiscount(product.price, product.discountPercentage)
            : product.price;

          return (
            <div
              key={product.id}
              className="group relative flex-none w-[260px] sm:w-[280px] md:w-[320px] snap-center sm:snap-start bg-background/50 backdrop-blur-sm border border-border/50 rounded-3xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30"
            >
              {/* نشانگر تخفیف */}
              {product.discountPercentage && (
                <div className="absolute top-6 right-6 z-10 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/30">
                  {product.discountPercentage}٪
                </div>
              )}

              {/* دکمه لایک (مخفی در حالت عادی، نمایش در هاور) */}
              <button className="absolute top-6 left-6 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-rose-500 hover:bg-rose-500/10">
                <Heart className="size-5" />
              </button>

              {/* تصویر محصول */}
              <Link
                href={`/products/${product.slug}`}
                className="block relative aspect-square mb-4 rounded-2xl overflow-hidden bg-secondary/20"
              >
                <Image
                  src={product.image || PLACEHOLDER_IMAGE}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 260px, 320px"
                  className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                />
              </Link>

              {/* اطلاعات محصول */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{product.brand}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    <span className="pt-0.5 font-medium text-foreground">{product.rating}</span>
                  </div>
                </div>

                <Link href={`/products/${product.slug}`}>
                  <h4 className="font-bold text-sm md:text-base line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                    {product.title}
                  </h4>
                </Link>

                <div className="flex items-end justify-between pt-4">
                  <div className="space-y-1">
                    {product.discountPercentage && (
                      <div className="text-xs text-muted-foreground line-through decoration-rose-500/50">
                        {product.price.toLocaleString('fa-IR')} تومان
                      </div>
                    )}
                    <div className="font-black text-lg text-primary">
                      {finalPrice.toLocaleString('fa-IR')}{' '}
                      <span className="text-xs font-normal text-muted-foreground">تومان</span>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className="rounded-xl shadow-lg shadow-primary/25 opacity-100 sm:opacity-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <ShoppingCart className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
