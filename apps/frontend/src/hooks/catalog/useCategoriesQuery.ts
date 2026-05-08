import { useQuery } from '@tanstack/react-query';
import { useCategories } from '@/hooks/useCategories';

export function useCategoriesQuery() {
  return useCategories();
}
