'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useWishlistStore } from '@/lib/store/wishlist-store';

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const clear = useWishlistStore((state) => state.clear);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <h1 className="text-2xl font-bold">علاقه‌مندی‌ها</h1>
        </div>

        {items.length > 0 && (
          <Button variant="outline" onClick={clear}>
            پاک کردن همه
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
          
            <Link href="/products">
           <Button  className="mt-4">
           مشاهده محصولات
           </Button>
           </Link>
          
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <ProductCard
              key={item.id}
              product={{
                ...item,
                thumbnailAlt: item.thumbnailAlt ?? item.title,
                specs: [],
                isUnavailable: !item.inStock,
              }}
              index={index}
              inStock={item.inStock}
            />
          ))}
        </div>
      )}
    </main>
  );
}
