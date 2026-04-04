import { redirect } from 'next/navigation'
import { isSetupComplete } from '@/lib/setup'
import { SetupForm } from './setup-form'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  if (await isSetupComplete()) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">🏠 Haushalt-Quest</h1>
        <SetupForm />
      </div>
    </main>
  )
}
