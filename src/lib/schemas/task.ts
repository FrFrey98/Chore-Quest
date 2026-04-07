import { z } from 'zod'

const scheduleDaysPattern = /^[0-6](,[0-6])*$/

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  emoji: z.string().min(1, 'Emoji is required'),
  points: z.coerce.number().int('Points must be an integer').positive('Points must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  isRecurring: z.coerce.boolean().default(false),
  recurringInterval: z.string().nullable().default(null),
  allowMultiple: z.coerce.boolean().default(false),
  dailyLimit: z.coerce.number().int().positive().nullable().default(null),
  scheduleDays: z
    .string()
    .regex(scheduleDaysPattern, 'Invalid weekdays')
    .nullable()
    .default(null),
  scheduleTime: z.string().nullable().default(null),
  assignedUserIds: z.array(z.string()).default([]),
  decayHours: z.coerce.number().int().positive().nullable().optional(),
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
