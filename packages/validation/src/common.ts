import { z } from 'zod'

// ---- Reusable field validators ----

export const emailSchema = z.string().email('Please enter a valid email address').min(1, 'Email is required')

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')

export const phoneOptionalSchema = phoneSchema.optional().or(z.literal(''))

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters')

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens')
  .min(2, 'Slug must be at least 2 characters')

export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode')

export const gstinSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Please enter a valid GSTIN'
  )

export const hsnCodeSchema = z
  .string()
  .regex(/^\d{4,8}$/, 'HSN code must be 4-8 digits')

export const priceSchema = z.number().min(0, 'Price cannot be negative').multipleOf(0.01)

export const quantitySchema = z.number().int().min(0, 'Quantity cannot be negative')

export const positiveQuantitySchema = z.number().int().min(1, 'Quantity must be at least 1')

export const percentageSchema = z.number().min(0).max(100, 'Percentage must be between 0 and 100')

export const urlSchema = z.string().url('Please enter a valid URL').optional().or(z.literal(''))

export const idSchema = z.string().uuid('Invalid ID format')
