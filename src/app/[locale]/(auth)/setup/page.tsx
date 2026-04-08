import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { isSetupComplete } from '@/lib/setup'
import { SetupForm } from './setup-form'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const t = await getTranslations('auth.login')

  if (await isSetupComplete()) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-lg">
        <h1 className="text-[1.75rem] font-light uppercase tracking-wide leading-tight text-center mb-2">{t('heading')}</h1>
        <SetupForm />
      </div>
    </main>
  )
}
