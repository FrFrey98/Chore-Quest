'use client'
import { useEffect, useState, useRef } from 'react'
import { Download, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const { data: session } = useSession()
  const t = useTranslations('pwa')
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/settings/users/${session.user.id}/install-status`)
      .then((r) => r.json())
      .then((data) => setDismissed(data.dismissed))
      .catch(() => {})
  }, [session?.user?.id])

  useEffect(() => {
    if (dismissed) return

    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    if (ios) {
      setIsIOS(true)
      setShow(true)
      return
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [dismissed])

  async function handleInstall() {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    deferredPrompt.current = null
  }

  async function handleDismiss() {
    setShow(false)
    if (!session?.user?.id) return
    try {
      await fetch(`/api/settings/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installPromptDismissed: true }),
      })
    } catch {
      // Silent fail
    }
  }

  if (!show) return null

  return (
    <div className="mx-4 mt-3 bg-accent text-white rounded-xl p-4 flex items-start gap-3 shadow-lg">
      <Download size={24} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold">{t('installPrompt')}</div>
        {isIOS ? (
          <p className="text-xs text-accent-foreground/70 mt-1">
            {t('iosInstructions', { share: t('share'), addToHome: t('addToHome') })}
          </p>
        ) : (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleInstall}
              className="bg-white text-accent text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-accent/10 transition-colors"
            >
              {t('install')}
            </button>
            <button
              onClick={handleDismiss}
              className="text-accent-foreground/70 text-xs font-medium px-3 py-1.5 hover:text-white transition-colors"
            >
              {t('later')}
            </button>
          </div>
        )}
      </div>
      {isIOS && (
        <button onClick={handleDismiss} className="text-accent-foreground/70 hover:text-white">
          <X size={18} />
        </button>
      )}
    </div>
  )
}
