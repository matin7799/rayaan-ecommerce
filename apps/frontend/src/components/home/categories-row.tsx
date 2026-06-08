'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useCategories } from '@/lib/hooks/queries/useCategories';
import React, { useState } from 'react';
import { Category } from '@/services';

export function CategoriesRow() {
  const { data: categories, isLoading } = useCategories();
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  
    // Filter only parent categories (parentId is null or undefined)
    const parentCategories = React.useMemo(() => {
      return categories?.filter(cat => !cat.parentId) || [];
    }, [categories]);

  if (isLoading) {
    return (
      <section className="py-8 my-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!parentCategories || parentCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-primary inline-block"></span>
            خرید بر اساس دسته‌بندی
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">محبوب‌ترین دسته‌های فروشگاه را کاوش کنید</p>
        </div>
        <Button variant="ghost" className="hidden sm:flex text-primary hover:bg-primary/10 rounded-full">
          مشاهده همه
          <ChevronLeft className="w-4 h-4 mr-1" />
        </Button>
      </div>
      
      {/* Categories Grid/Scroll */}
      <div className="flex overflow-x-auto pb-6 hide-scrollbar gap-6 md:gap-10 justify-start lg:justify-center px-2">
        {parentCategories.slice(0, 8).map((category) => (
          <Link 
            key={category.id}
            href={`products/category/${category.slug}`}
            className="flex flex-col items-center gap-4 min-w-27.5 group cursor-pointer"
          >
            {/* Gradient Ring & Image Container */}
            <div className="relative p-0.75 rounded-full bg-linear-to-tr from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 group-hover:from-primary group-hover:to-purple-500 transition-all duration-500 shadow-sm group-hover:shadow-primary/30 group-hover:shadow-xl">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white dark:border-neutral-950 bg-white">
                <Image
                  src={`https://ranew.s3.ir-thr-at1.arvanstorage.ir/categories/${category.slug}.jpg`}
                  alt={category.name}
                  fill
                  sizes="(min-width: 768px) 112px, 96px"
                  className="object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-700 ease-out"
                />
                {/* Dark overlay for better hover effect */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
              </div>
            </div>
            
            {/* Title */}
            <span className="text-sm md:text-base font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors duration-300 text-center">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
