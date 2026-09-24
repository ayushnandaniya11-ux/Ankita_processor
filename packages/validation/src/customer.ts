import { z } from 'zod'
import { nameSchema, emailSchema, phoneOptionalSchema } from './common'

export const customerProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneOptionalSchema,
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER']).optional(),
})

export type CustomerProfileFormData = z.infer<typeof customerProfileSchema>
