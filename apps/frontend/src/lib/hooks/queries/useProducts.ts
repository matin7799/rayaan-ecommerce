import { useQuery } from '@tanstack/react-query';
import { getProducts, GetProductsParams } from '@/lib/api/products';

// هوک پایه برای دریافت محصولات
export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    staleTime: 1000 * 60 * 5, 
    retry: 2,
  });
}

// هوک اختصاصی برای دریافت محصولات بر اساس دسته‌بندی
export function useProductsByCategory(categorySlug: string) {
  // استفاده از categorySlug طبق اینترفیس GetProductsParams
  return useProducts({ categorySlug });
}
