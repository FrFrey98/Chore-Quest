'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTransition } from 'react'

export function LocaleSwitcher() {
  const t = useTranslations('locale')
  const locale = useLocale()
  const router = useRouter()
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()

  async function onChange(newLocale: string) {
    // Save to user profile if logged in
    if (session?.user?.id) {
      await fetch(`/api/users/${session.user.id}/locale`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      })
    }

    // Set cookie and refresh
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <select
      value={locale}
      onChange={(e) => onChange(e.target.value)}
      disabled={isPending}
      aria-label={t('label')}
      className="text-sm bg-transparent border rounded px-2 py-1"
    >
      <option value="en">{t('en')}</option>
      <option value="de">{t('de')}</option>
    </select>
  )
}
