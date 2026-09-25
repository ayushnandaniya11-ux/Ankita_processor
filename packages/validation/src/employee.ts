import { z } from 'zod'
import { nameSchema, emailSchema, phoneOptionalSchema, passwordSchema } from './common'

export const employeeSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneOptionalSchema,
  password: passwordSchema.optional().or(z.literal('')),
  roleId: z.string().min(1, 'Role is required'),
  department: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
})

export const roleSchema = z.object({
  name: nameSchema,
  slug: z
    .string()
    .min(2)
    .regex(/^[A-Z_]+$/, 'Slug must be uppercase letters and underscores'),
  description: z.string().max(500).optional().or(z.literal('')),
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type RoleFormData = z.infer<typeof roleSchema>
