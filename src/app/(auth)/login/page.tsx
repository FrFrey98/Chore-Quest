import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  })

  if (users.length === 0) {
    redirect('/setup')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">🏠 Chore-Quest</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Wer bist du?</p>
        <LoginForm users={users} />
      </div>
    </main>
  )
}
