import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { productService, ProductsQueryParams } from '@/services';

interface UseInfiniteProductsOptions {
  categoryId?: string;
}

export function useInfiniteProducts(options: UseInfiniteProductsOptions = {}) {
  const searchParams = useSearchParams();

  const categoriesFromUrl = searchParams.get('categories') || undefined;
  const search = searchParams.get('search') || undefined;
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;
  const sortBy = searchParams.get('sortBy') as
    | 'price'
    | 'createdAt'
    | 'title'
    | undefined;
  const sortOrder = searchParams.get('sortOrder') as 'ASC' | 'DESC' | undefined;
  const brandId = searchParams.get('brandId') || undefined;
  const inStock = searchParams.get('inStock')
    ? searchParams.get('inStock') === 'true'
    : undefined;

  const categories = categoriesFromUrl || options.categoryId || undefined;

  return useInfiniteQuery({
    queryKey: [
      'products',
      'infinite',
      categories,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      brandId,
      inStock,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params: ProductsQueryParams = {
        page: pageParam,
        limit: 20,
        categories,
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        brandId,
        inStock,
      };

      return productService.getProducts(params);
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
}
