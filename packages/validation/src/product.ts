import { z } from 'zod'
import {
  nameSchema,
  slugSchema,
  priceSchema,
  hsnCodeSchema,
  quantitySchema,
  percentageSchema,
} from './common'

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  color: z.string().min(1, 'Color is required'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional()
    .or(z.literal('')),
  size: z.string().min(1, 'Size is required'),
  mrp: priceSchema,
  sellingPrice: priceSchema,
  wholesalePrice: priceSchema.optional(),
  costPrice: priceSchema.optional(),
  stock: quantitySchema,
  lowStockThreshold: quantitySchema,
  isActive: z.boolean(),
})

export const productSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z
    .string()
    .max(200, 'Short description must be at most 200 characters')
    .optional()
    .or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional().or(z.literal('')),
  brand: z.string().optional().or(z.literal('')),
  fabric: z.string().optional().or(z.literal('')),
  gender: z.enum(['FEMALE', 'MALE', 'UNISEX']),
  mrp: priceSchema,
  sellingPrice: priceSchema,
  wholesalePrice: priceSchema.optional(),
  costPrice: priceSchema.optional(),
  gstRate: percentageSchema,
  hsnCode: hsnCodeSchema,
  weight: z.number().min(0).optional(),
  dimensionLength: z.number().min(0).optional(),
  dimensionWidth: z.number().min(0).optional(),
  dimensionHeight: z.number().min(0).optional(),
  isReturnable: z.boolean(),
  isExchangeable: z.boolean(),
  returnWindow: z.number().int().min(0).max(30),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
  isPublished: z.boolean(),
  metaTitle: z.string().max(70).optional().or(z.literal('')),
  metaDescription: z.string().max(160).optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
})

export type ProductFormData = z.infer<typeof productSchema>
export type ProductVariantFormData = z.infer<typeof productVariantSchema>
