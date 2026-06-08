'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, History, Monitor, Smartphone, X, Loader2 } from 'lucide-react';
import { productService } from '@/services';
import type { ProductListItem } from '@/services';
import Image from 'next/image';

export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  // بستن دراپ‌داون هنگام کلیک بیرون از آن
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // جستجوی زنده با debounce
  useEffect(() => {
    if (searchTimeoutRef.current !== undefined) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    const performSearch = async () => {
      // اگر query کوتاه‌تر از 2 کاراکتر است
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await productService.getProducts({
          search: query.trim(),
          limit: 6,
          page: 1,
        });
        setSearchResults(response.items);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchTimeoutRef.current = window.setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (searchTimeoutRef.current !== undefined) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams();
    params.set('search', searchQuery.trim());
    
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`);
    setIsOpen(false);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setIsOpen(false);
    setQuery('');
  };

  const hasResults = searchResults.length > 0;

  return (
    <div className="hidden md:flex flex-1 max-w-xl relative" ref={containerRef}>
      {/* Search Bar Input */}
      <div className="relative w-full z-51">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
          <Search className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#008080]' : ''}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="جستجو در بین هزاران کالا در رایان تِک..."
          className={`w-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border 
            ${isOpen ? 'border-[#008080]/50 shadow-md bg-white/80 dark:bg-gray-900/80' : 'border-white/40 dark:border-gray-800/50 hover:bg-white/60 dark:hover:bg-gray-800/60'} 
            rounded-2xl pr-12 pl-16 h-12 flex items-center text-sm text-gray-900 dark:text-white placeholder:text-gray-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all outline-none`}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 gap-2">
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute top-full mt-3 right-0 w-full lg:w-[120%] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/50 dark:border-gray-700/50 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* نتایج جستجو */}
          {query.trim().length >= 2 && (
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                <Search className="w-4 h-4 text-[#008080]" /> نتایج جستجو
              </h3>
              
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#008080]" />
                </div>
              ) : hasResults ? (
                <div className="space-y-2">
                  {searchResults.map((product) => {
                    const placeholderImage = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';
                    const firstImage = product.images?.[0]?.url?.trim();
                    const firstGallery = product.media?.gallery?.[0]?.url?.trim();
                    const mediaThumbnail = product.media?.thumbnail?.url?.trim();
                    const thumbnailUrl = product.thumbnailUrl?.trim();
                    const imageSrc =
                      firstImage || mediaThumbnail || firstGallery || thumbnailUrl || placeholderImage;

                    const firstVariant = product.variants?.[0];
                    const basePrice =
                      product.pricing?.basePrice ??
                      firstVariant?.comparePrice ??
                      firstVariant?.price ??
                      0;
                    const finalPrice =
                      product.pricing?.finalPrice ??
                      firstVariant?.price ??
                      basePrice;
                    const hasDiscount = finalPrice < basePrice;
                    
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 dark:hover:bg-gray-800/70 cursor-pointer transition-all group"
                      >
                        <Image
                          src={imageSrc}
                          alt={product.title}
                          height={100}
                          width={100}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-[#008080] transition-colors">
                            {product.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            {hasDiscount ? (
                              <span className="text-xs text-gray-400 line-through">
                                {basePrice.toLocaleString('fa-IR')} تومان
                              </span>
                            ) : null}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {finalPrice.toLocaleString('fa-IR')} تومان
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full mt-2 py-2 text-sm text-[#008080] hover:text-[#006666] font-medium transition-colors"
                  >
                    مشاهده همه نتایج ({searchResults.length}+)
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    نتیجه‌ای یافت نشد
                  </p>
                </div>
              )}
            </div>
          )}

          {/* پیشنهادات */}
          {!query.trim() && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-linear-to-b from-transparent to-white/30 dark:to-black/20">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                  <TrendingUp className="w-4 h-4 text-rose-500" /> جستجوهای پرطرفدار
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['آیفون ۱۵ پرو', 'لپ تاپ ایسوس', 'مانیتور گیمینگ', 'مک بوک m3'].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleTrendingClick(item)}
                      className="px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 border border-white/50 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-[#008080] hover:text-white cursor-pointer transition-colors shadow-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4">
                  <History className="w-4 h-4 text-blue-500" /> دسته‌های پیشنهادی
                </h3>
                <ul className="space-y-2">
                  <li 
                    onClick={() => handleCategoryClick('mobile')}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Smartphone className="w-4 h-4 text-gray-500" /></div>
                    <span className="text-sm font-medium">گوشی موبایل</span>
                  </li>
                  <li 
                    onClick={() => handleCategoryClick('computer-parts')}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Monitor className="w-4 h-4 text-gray-500" /></div>
                    <span className="text-sm font-medium">قطعات کامپیوتر</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
