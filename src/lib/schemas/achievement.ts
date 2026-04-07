import { z } from 'zod'

const VALID_CONDITION_TYPES = [
  'task_count',
  'category_count',
  'streak_days',
  'total_points',
  'level',
] as const

export const createAchievementSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').trim(),
  description: z.string().min(1, 'Beschreibung ist erforderlich').trim(),
  emoji: z.string().min(1, 'Emoji ist erforderlich'),
  conditionType: z.enum(VALID_CONDITION_TYPES, {
    message: 'Ungültiger Bedingungstyp',
  }),
  conditionValue: z
    .number()
    .int()
    .min(0, 'conditionValue muss eine nicht-negative Zahl sein'),
  conditionMeta: z.string().nullable().default(null),
  sortOrder: z.number().int().default(0),
})

export const updateAchievementSchema = createAchievementSchema.partial()

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>
