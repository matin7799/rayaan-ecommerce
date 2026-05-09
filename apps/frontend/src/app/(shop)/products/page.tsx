import { Suspense } from 'react';
import { CatalogListingClient } from '@/components/catalog/CatalogListingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'فروشگاه | تمام محصولات',
  description: 'جستجو و خرید انواع محصولات با بهترین قیمت',
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-64 rounded bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CatalogListingClient title="همه محصولات" />
    </Suspense>
  );
}
