import { Suspense } from 'react';
import { CatalogTableListingClient } from '@/components/catalog/CatalogTableListingClient';

export const metadata = {
  title: 'فروشگاه | جدول کاتالوگ',
  description: 'نمای جدول محصولات با فیلتر دسته‌بندی و بازه قیمت',
};

export default function CatalogTablePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
            <div className="h-72 rounded bg-gray-200" />
          </div>
        </div>
      }
    >
      <CatalogTableListingClient />
    </Suspense>
  );
}
