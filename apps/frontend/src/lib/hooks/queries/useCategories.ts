import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
