import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@/generated/prisma/enums'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'PIN',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        pin: { label: 'PIN', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.pin) return null

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.pin, user.pin)
        if (!valid) return null

        return { id: user.id, name: user.name, role: user.role }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as unknown as { role: Role }).role }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
}
