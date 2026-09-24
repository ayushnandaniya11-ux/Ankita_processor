// ============================================
// Category Types
// ============================================

import type { BaseEntity } from './common'

export interface Category extends BaseEntity {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  sortOrder: number
  isActive: boolean
  productCount: number
  metaTitle?: string
  metaDescription?: string
}

export interface CategoryFormData {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
}

export interface CategoryTreeItem extends Category {
  children: CategoryTreeItem[]
  depth: number
}
