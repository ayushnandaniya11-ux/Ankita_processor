import { z } from 'zod'
import { nameSchema, slugSchema } from './common'

export const categorySchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  metaTitle: z.string().max(70).optional().or(z.literal('')),
  metaDescription: z.string().max(160).optional().or(z.literal('')),
})

export type CategoryFormData = z.infer<typeof categorySchema>
