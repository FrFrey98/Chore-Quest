import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const t = await getTranslations('auth.login')

  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true },
  })

  if (users.length === 0) {
    redirect('/setup')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-sm p-8 bg-card rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">{t('heading')}</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">{t('subtitle')}</p>
        <LoginForm users={users} />
      </div>
    </main>
  )
}
