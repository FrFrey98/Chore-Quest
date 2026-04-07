import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  emoji: z.string().min(1, 'Emoji is required'),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
