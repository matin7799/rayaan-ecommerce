// components/features/products/ProductListingClient.tsx
'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { FilterSidebar } from './FilterSidebar';
import { SortBar } from './SortBar';
import { InfiniteProductGrid } from './InfiniteProductGrid';

interface ProductListingClientProps {
  title?: string;
  categoryId?: string; // برای پاس دادن به گرید یا استور جهت فیلتر اولیه
}

export function ProductListingClient({ 
  title = 'محصولات', 
  categoryId 
}: ProductListingClientProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* هدر موبایل */}
      <div className="flex flex-col gap-4 lg:hidden mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger className="flex items-center gap-2 px-4 py-2 border border-border rounded-md bg-background text-sm font-medium hover:bg-accent transition-colors">
              <Filter className="w-4 h-4" />
              فیلترها
            </SheetTrigger>
            
            <SheetContent side="right" className="w-full sm:w-87.5 p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="text-right text-lg font-bold">فیلتر محصولات</SheetTitle>
              </SheetHeader>
              <div className="p-4 flex-1 overflow-y-auto">
                <FilterSidebar 
                  isMobile={true} 
                  onClose={() => setIsMobileFiltersOpen(false)} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <SortBar />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* سایدبار دسکتاپ */}
        <aside className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* بخش اصلی محتوا */}
        <main className="flex-1 min-w-0">
          {/* هدر دسکتاپ */}
          <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h1 className="text-3xl font-bold">{title}</h1>
            <SortBar />
          </div>

          {/* گرید محصولات (مقدار categoryId به آن پاس داده می‌شود تا فیلتر اولیه اعمال شود) */}
          <InfiniteProductGrid initialCategoryId={categoryId} />
        </main>
      </div>
    </div>
  );
}
