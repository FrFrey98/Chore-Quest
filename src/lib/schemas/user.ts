import { z } from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name muss mindestens 2 Zeichen haben')
    .max(50, 'Name darf maximal 50 Zeichen haben'),
  pin: z.string().regex(/^\d{4,8}$/, 'PIN muss 4-8 Ziffern haben'),
  role: z
    .enum(['admin', 'member', 'child'], { message: 'Ungültige Rolle' })
    .default('member'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
