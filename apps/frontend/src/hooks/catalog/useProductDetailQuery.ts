import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/services/catalog.service';

export function useProductDetailQuery(id: string) {
  return useQuery({
    queryKey: ['catalog', 'product', id],
    queryFn: () => fetchProductById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
