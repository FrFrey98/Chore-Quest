import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').trim(),
  emoji: z.string().min(1, 'Emoji ist erforderlich'),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
