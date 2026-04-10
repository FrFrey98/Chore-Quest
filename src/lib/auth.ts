import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@/generated/prisma/enums'

export async function getCurrentUser(): Promise<{ id: string; role: string } | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return { id: session.user.id, role: session.user.role }
}

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

        return { id: user.id, name: user.name, role: user.role, locale: user.locale }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as unknown as { role: Role }).role
        token.locale = (user as unknown as { locale: string }).locale
      }
      // Backfill role/locale for old tokens that don't have them
      if (token.id && (!token.role || !token.locale)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, locale: true },
        })
        if (dbUser) {
          if (!token.role) token.role = dbUser.role
          if (!token.locale) token.locale = dbUser.locale
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.locale = token.locale
      return session
    },
  },
}
