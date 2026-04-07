import { z } from 'zod'

export const createStoreItemSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').trim(),
  emoji: z.string().min(1, 'Emoji ist erforderlich'),
  description: z.string().default(''),
  pointCost: z.coerce
    .number()
    .int('Kosten müssen ganzzahlig sein')
    .positive('Kosten müssen positiv sein'),
  isActive: z.boolean().default(true),
})

export const updateStoreItemSchema = createStoreItemSchema.partial()

export type CreateStoreItemInput = z.infer<typeof createStoreItemSchema>
export type UpdateStoreItemInput = z.infer<typeof updateStoreItemSchema>
