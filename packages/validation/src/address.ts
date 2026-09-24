import { z } from 'zod'
import { nameSchema, phoneSchema, pincodeSchema } from './common'

export const addressSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  addressLine1: z.string().min(5, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: pincodeSchema,
  country: z.string().default('India'),
  type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
  isDefault: z.boolean().default(false),
})

export type AddressFormData = z.infer<typeof addressSchema>
