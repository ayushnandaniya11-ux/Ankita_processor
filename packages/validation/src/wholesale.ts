import { z } from 'zod'
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  gstinSchema,
  pincodeSchema,
} from './common'

export const wholesaleRegisterSchema = z
  .object({
    businessName: z.string().min(2, 'Business name is required').max(200),
    ownerName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    gstin: gstinSchema,
    businessAddress: z.string().min(10, 'Business address is required').max(500),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    pincode: pincodeSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type WholesaleRegisterFormData = z.infer<typeof wholesaleRegisterSchema>
