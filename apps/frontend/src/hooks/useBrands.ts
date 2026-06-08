// src/hooks/useBrands.ts
import { getBrands } from '@/services/catalog.service';
import { useQuery } from '@tanstack/react-query';


export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    select: (brands) =>
      brands.filter((brand) => brand?.slug && brand?.isActive !== false),
  });
}
