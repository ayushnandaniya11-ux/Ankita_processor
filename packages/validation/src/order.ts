import { z } from 'zod'

export const createOrderSchema = z.object({
  addressId: z.string().uuid('Please select a delivery address'),
  paymentMethod: z.enum(['ONLINE', 'COD', 'UPI', 'CARD', 'NET_BANKING', 'WALLET']),
  couponCode: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type CreateOrderFormData = z.infer<typeof createOrderSchema>
