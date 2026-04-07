import type { DefaultSession } from 'next-auth'
import type { Role } from '@/generated/prisma/enums'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: Role
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}
