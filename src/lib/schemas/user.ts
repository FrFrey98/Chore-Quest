import { z } from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  pin: z.string().regex(/^\d{4,8}$/, 'PIN must be 4-8 digits'),
  role: z
    .enum(['admin', 'member', 'child'], { message: 'Invalid role' })
    .default('member'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
