import { z } from 'zod'

export const createStoreItemSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  emoji: z.string().min(1, 'Emoji is required'),
  description: z.string().default(''),
  pointCost: z.coerce
    .number()
    .int('Cost must be an integer')
    .positive('Cost must be positive'),
  isActive: z.boolean().default(true),
})

export const updateStoreItemSchema = createStoreItemSchema.partial()

export type CreateStoreItemInput = z.infer<typeof createStoreItemSchema>
export type UpdateStoreItemInput = z.infer<typeof updateStoreItemSchema>
