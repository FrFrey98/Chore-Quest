import { z } from 'zod'

const VALID_CONDITION_TYPES = [
  'task_count',
  'category_count',
  'streak_days',
  'total_points',
  'level',
] as const

export const createAchievementSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  emoji: z.string().min(1, 'Emoji is required'),
  conditionType: z.enum(VALID_CONDITION_TYPES, {
    message: 'Invalid condition type',
  }),
  conditionValue: z
    .number()
    .int()
    .min(0, 'conditionValue must be a non-negative number'),
  conditionMeta: z.string().nullable().default(null),
  sortOrder: z.number().int().default(0),
})

export const updateAchievementSchema = createAchievementSchema.partial()

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>
