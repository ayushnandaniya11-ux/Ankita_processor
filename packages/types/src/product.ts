// ============================================
// Product Types
// ============================================

import type { BaseEntity } from './common'
import type { Category } from './category'

export interface Product extends BaseEntity {
  name: string
  slug: string
  sku: string
  description: string
  shortDescription?: string
  categoryId: string
  category?: Category
  subcategoryId?: string
  subcategory?: Category
  brand?: string
  fabric?: string
  gender: 'FEMALE' | 'MALE' | 'UNISEX'
  images: ProductImage[]
  variants: ProductVariant[]
  mrp: number
  sellingPrice: number
  wholesalePrice?: number
  costPrice?: number
  gstRate: number
  hsnCode: string
  weight?: number
  dimensionLength?: number
  dimensionWidth?: number
  dimensionHeight?: number
  isReturnable: boolean
  isExchangeable: boolean
  returnWindow: number
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isPublished: boolean
  avgRating: number
  totalReviews: number
  totalSold: number
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
}

export interface ProductImage extends BaseEntity {
  productId: string
  url: string
  altText?: string
  sortOrder: number
  isPrimary: boolean
}

export interface ProductVariant extends BaseEntity {
  productId: string
  sku: string
  color: string
  colorHex?: string
  size: string
  mrp: number
  sellingPrice: number
  wholesalePrice?: number
  costPrice?: number
  stock: number
  lowStockThreshold: number
  isActive: boolean
}

export interface ProductListParams {
  page?: number
  perPage?: number
  search?: string
  categoryId?: string
  categorySlug?: string
  sortBy?: 'name' | 'price' | 'createdAt' | 'popularity' | 'totalSold'
  sortOrder?: 'asc' | 'desc'
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  fabrics?: string[]
  inStock?: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  isFeatured?: boolean
  isPublished?: boolean
  hasDiscount?: boolean
  collection?: string
}

export interface ProductFormData {
  name: string
  slug: string
  sku: string
  description: string
  shortDescription?: string
  categoryId: string
  subcategoryId?: string
  brand?: string
  fabric?: string
  gender: 'FEMALE' | 'MALE' | 'UNISEX'
  mrp: number
  sellingPrice: number
  wholesalePrice?: number
  costPrice?: number
  gstRate: number
  hsnCode: string
  weight?: number
  dimensionLength?: number
  dimensionWidth?: number
  dimensionHeight?: number
  isReturnable: boolean
  isExchangeable: boolean
  returnWindow: number
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isPublished: boolean
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  variants: ProductVariantFormData[]
}

export interface ProductVariantFormData {
  id?: string
  sku: string
  color: string
  colorHex?: string
  size: string
  mrp: number
  sellingPrice: number
  wholesalePrice?: number
  costPrice?: number
  stock: number
  lowStockThreshold: number
  isActive: boolean
}

/** Available product sizes */
export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'] as const
export type ProductSize = (typeof PRODUCT_SIZES)[number]

/** Common fabric types */
export const FABRIC_TYPES = [
  'Cotton',
  'Silk',
  'Chiffon',
  'Georgette',
  'Crepe',
  'Rayon',
  'Linen',
  'Polyester',
  'Satin',
  'Velvet',
  'Net',
  'Organza',
  'Chanderi',
  'Banarasi',
  'Tussar',
  'Khadi',
  'Denim',
  'Lycra',
  'Blend',
] as const
export type FabricType = (typeof FABRIC_TYPES)[number]
