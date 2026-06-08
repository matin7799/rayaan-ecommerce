import { SelectQueryBuilder } from 'typeorm';
import { Product } from '../entities/product.entity';
import {
  QueryCatalogDto,
  SortField,
  SortOrder,
} from '../dto/query-catalog.dto';
import { ProductsRepository } from '../catalog.repository';

export function applyFilters(
  queryBuilder: SelectQueryBuilder<Product>,
  query: QueryCatalogDto,
): void {
  if (query.search) {
    queryBuilder.andWhere(
      `(
        product.name ILIKE :search
        OR product.description ILIKE :search
        OR category.name ILIKE :search
        OR category.slug ILIKE :search
        OR tag.name ILIKE :search
        OR tag.slug ILIKE :search
      )`,
      { search: `%${query.search}%` },
    );
  }

  if (query.categorySlugs?.length) {
    queryBuilder.andWhere('category.slug IN (:...categorySlugs)', {
      categorySlugs: query.categorySlugs,
    });
  }

  if (query.brandSlugs?.length) {
    queryBuilder.andWhere('brand.slug IN (:...brandSlugs)', {
      brandSlugs: query.brandSlugs,
    });
  }

  if (query.tagSlugs?.length) {
    queryBuilder.andWhere('tag.slug IN (:...tagSlugs)', {
      tagSlugs: query.tagSlugs,
    });
  }

  if (query.isFeatured !== undefined) {
    queryBuilder.andWhere('product.isFeatured = :isFeatured', {
      isFeatured: query.isFeatured,
    });
  }

  if (query.minPrice !== undefined) {
    queryBuilder.andWhere('product.basePrice >= :minPrice', {
      minPrice: query.minPrice,
    });
  }

  if (query.maxPrice !== undefined) {
    queryBuilder.andWhere('product.basePrice <= :maxPrice', {
      maxPrice: query.maxPrice,
    });
  }
}

export function applySorting(
  queryBuilder: SelectQueryBuilder<Product>,
  sortBy: SortField,
  sortOrder: SortOrder,
): void {
  const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';
  queryBuilder.addSelect(
    'CASE WHEN product.stockQuantity > 0 THEN 0 ELSE 1 END',
    'stock_sort_order',
  );
  queryBuilder.orderBy('stock_sort_order', 'ASC');

  switch (sortBy) {
    case SortField.PRICE:
      queryBuilder.addOrderBy('product.basePrice', direction);
      break;
    case SortField.NAME:
      queryBuilder.addOrderBy('product.name', direction);
      break;
    case SortField.CREATED_AT:
    default:
      queryBuilder.addOrderBy('product.createdAt', direction);
      break;
  }
}

export function addPricingSelects(
  queryBuilder: SelectQueryBuilder<Product>,
): SelectQueryBuilder<Product> {
  return queryBuilder.addSelect([
    'product.basePrice',
    'product.salePrice',
    'product.partnerDiscountPercent',
    'product.isOnSale',
    'product.saleStartDate',
    'product.saleEndDate',
  ]);
}

export function addCatalogHiddenSelects(
  queryBuilder: SelectQueryBuilder<Product>,
): SelectQueryBuilder<Product> {
  return queryBuilder.addSelect([
    'product.stockQuantity',
    'product.trackInventory',
    'product.lowStockThreshold',
    'product.metaTitle',
    'product.metaDescription',
    'product.metaKeywords',
    'product.isActive',
    'product.isFeatured',
    'product.shortDescription',
    'product.basePrice',
    'product.salePrice',
    'product.isOnSale',
    'product.saleStartDate',
    'product.saleEndDate',
    'product.partnerDiscountPercent',
  ]);
}

export async function generateUniqueSlug(
  productsRepository: ProductsRepository,
  baseSlug: string,
  sku: string,
): Promise<string> {
  const normalizedSku = sku.trim();
  const slugWithSku = `${baseSlug}-${normalizedSku}`.toLowerCase();

  const existingSlugWithSku = await productsRepository.findBySlug(slugWithSku);
  if (!existingSlugWithSku) {
    return slugWithSku;
  }

  let suffix = 2;
  while (suffix <= 100) {
    const candidateSlug = `${slugWithSku}-${suffix}`;
    const existingCandidate =
      await productsRepository.findBySlug(candidateSlug);
    if (!existingCandidate) {
      return candidateSlug;
    }
    suffix += 1;
  }

  return `${slugWithSku}-${Date.now()}`;
}
