import { z } from 'zod'

const scheduleDaysPattern = /^[0-6](,[0-6])*$/

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').trim(),
  emoji: z.string().min(1, 'Emoji ist erforderlich'),
  points: z.coerce.number().int('Punkte müssen ganzzahlig sein').positive('Punkte müssen positiv sein'),
  categoryId: z.string().min(1, 'Kategorie ist erforderlich'),
  isRecurring: z.coerce.boolean().default(false),
  recurringInterval: z.string().nullable().default(null),
  allowMultiple: z.coerce.boolean().default(false),
  dailyLimit: z.coerce.number().int().positive().nullable().default(null),
  scheduleDays: z
    .string()
    .regex(scheduleDaysPattern, 'Ungültige Wochentage')
    .nullable()
    .default(null),
  scheduleTime: z.string().nullable().default(null),
  assignedUserIds: z.array(z.string()).default([]),
})

export const updateTaskSchema = createTaskSchema
  .omit({ categoryId: true })
  .partial()
  .extend({
    categoryId: z.string().min(1).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
