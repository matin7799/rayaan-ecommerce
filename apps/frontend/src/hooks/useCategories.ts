// src/hooks/useCategories.ts
import { apiClient } from '@/services/api-client';
import { useQuery } from '@tanstack/react-query';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  isActive?: boolean;
}

type CategoriesWrappedResponse =
  | Category[]
  | { success: boolean; data: Category[] }
  | Array<{ success: boolean; data: Category[] }>;

async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<CategoriesWrappedResponse>('/categories');
  const payload = response.data;

  // حالت: مستقیم آرایه category
  if (
    Array.isArray(payload) &&
    (payload.length === 0 || ('slug' in payload[0] && 'name' in payload[0]))
  ) {
    return payload as Category[];
  }

  // حالت: آرایه‌ای از wrapper
  if (Array.isArray(payload) && payload.length > 0 && 'data' in payload[0]) {
    return payload[0].data ?? [];
  }

  // حالت: wrapper object
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? [];
  }

  return [];
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    select: (categories) =>
      categories
        .filter((category) => category?.slug && category?.isActive !== false)
        .map((category) => ({
          ...category,
          parentId: category.parentId ?? null,
        })),
  });
}
