import { ProductStatus, MediaType, CategoryStatus } from './enums'

export interface ProductMedia {
  id: string
  url: string
  type: MediaType
  alt?: string
  order: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  discountPrice?: number
  stock: number
  sku?: string
  status: ProductStatus
  categoryId: string
  media: ProductMedia[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  status: CategoryStatus
  order: number
  createdAt: string
  updatedAt: string
}
