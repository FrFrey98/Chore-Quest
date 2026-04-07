'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Bell, BellOff, MessageCircle, Send } from 'lucide-react'

type NotificationsTabProps = {
  userId: string
  notificationsEnabled: boolean
  vapidPublicKey: string | null
  telegramConfigured: boolean
  telegramChatId: string | null
  ntfyConfigured: boolean
  ntfyEnabled: boolean
  ntfyTopicUrl: string | null
}

export function NotificationsTab({
  userId, notificationsEnabled, vapidPublicKey,
  telegramConfigured, telegramChatId,
  ntfyConfigured, ntfyEnabled: ntfyEnabledInitial, ntfyTopicUrl,
}: NotificationsTabProps) {
  const router = useRouter()
  const t = useTranslations('settings.notifications')
  const tc = useTranslations('common')
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(notificationsEnabled)
  const [loading, setLoading] = useState(false)

  // Telegram state
  const [tgConnected, setTgConnected] = useState(!!telegramChatId)
  const [tgLoading, setTgLoading] = useState(false)
  const [tgLinkCode, setTgLinkCode] = useState<string | null>(null)

  // ntfy state
  const [ntfyOn, setNtfyOn] = useState(ntfyEnabledInitial)
  const [ntfyLoading, setNtfyLoading] = useState(false)

  const pushSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
  const configured = !!vapidPublicKey

  async function handleToggle() {
    if (!pushSupported) {
      toast(t('notSupported'), 'error')
      return
    }

    if (!configured) {
      toast(t('notConfigured'), 'error')
      return
    }

    setLoading(true)
    try {
      if (!enabled) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          toast(t('permissionNeeded'), 'error')
          setLoading(false)
          return
        }

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })

        const subJson = subscription.toJSON()
        const res = await fetch('/api/notifications/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? tc('error'))
        }

        setEnabled(true)
        toast(t('enabled'), 'success')
      } else {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
        }

        await fetch('/api/notifications/push/subscribe', { method: 'DELETE' })
        setEnabled(false)
        toast(t('disabled'), 'info')
      }
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleTelegramConnect() {
    setTgLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/telegram`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      const { code } = await res.json()
      setTgLinkCode(code)
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setTgLoading(false)
    }
  }

  async function handleTelegramDisconnect() {
    setTgLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/telegram`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      setTgConnected(false)
      setTgLinkCode(null)
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setTgLoading(false)
    }
  }

  async function handleNtfyToggle() {
    setNtfyLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/ntfy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !ntfyOn }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      setNtfyOn(!ntfyOn)
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setNtfyLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Push notifications section */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? <Bell size={20} className="text-indigo-600" /> : <BellOff size={20} className="text-muted-foreground" />}
            <div>
              <div className="text-sm font-semibold text-foreground">{t('pushLabel')}</div>
              <div className="text-xs text-muted-foreground">{t('pushDescription')}</div>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || !pushSupported || !configured}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              enabled ? 'bg-indigo-600' : 'bg-muted-foreground/40'
            } ${loading || !pushSupported || !configured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-card rounded-full shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
        {!pushSupported && (
          <p className="text-xs text-amber-600 mt-2">{t('notSupported')}</p>
        )}
        {pushSupported && !configured && (
          <p className="text-xs text-amber-600 mt-2">{t('notConfigured')}</p>
        )}
      </div>

      {/* Telegram section */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Send size={20} className="text-sky-500" />
          <div>
            <div className="text-sm font-semibold text-foreground">{t('telegramHeading')}</div>
            <div className="text-xs text-muted-foreground">{t('telegramDescription')}</div>
          </div>
        </div>
        {!telegramConfigured ? (
          <p className="text-xs text-amber-600 mt-2">{t('telegramNotConfigured')}</p>
        ) : tgConnected ? (
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
              {t('telegramConnected')}
            </span>
            <button
              onClick={handleTelegramDisconnect}
              disabled={tgLoading}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              {t('telegramDisconnect')}
            </button>
          </div>
        ) : (
          <div className="mt-3">
            {!tgLinkCode ? (
              <button
                onClick={handleTelegramConnect}
                disabled={tgLoading}
                className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
              >
                {tgLoading ? tc('loading') : t('telegramConnect')}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t('telegramLinkInstructions')}</p>
                <code className="block bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground select-all">
                  {t('telegramLinkCode', { code: tgLinkCode })}
                </code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ntfy section */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle size={20} className="text-emerald-600" />
          <div>
            <div className="text-sm font-semibold text-foreground">{t('ntfyHeading')}</div>
            <div className="text-xs text-muted-foreground">{t('ntfyDescription')}</div>
          </div>
        </div>
        {!ntfyConfigured ? (
          <p className="text-xs text-amber-600 mt-2">{t('ntfyNotConfigured')}</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('ntfyEnable')}</span>
              <button
                onClick={handleNtfyToggle}
                disabled={ntfyLoading}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  ntfyOn ? 'bg-emerald-600' : 'bg-muted-foreground/40'
                } ${ntfyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-card rounded-full shadow transition-transform ${
                  ntfyOn ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {ntfyOn && ntfyTopicUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('ntfyTopic')}</p>
                <code className="block bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground select-all break-all">
                  {ntfyTopicUrl}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
