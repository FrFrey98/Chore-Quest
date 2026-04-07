'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Bell, BellOff } from 'lucide-react'

type NotificationsTabProps = {
  userId: string
  notificationsEnabled: boolean
  vapidPublicKey: string | null
}

export function NotificationsTab({ userId, notificationsEnabled, vapidPublicKey }: NotificationsTabProps) {
  const router = useRouter()
  const t = useTranslations('settings.notifications')
  const tc = useTranslations('common')
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(notificationsEnabled)
  const [loading, setLoading] = useState(false)

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
        // Enable: request permission + subscribe
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
        // Disable: unsubscribe + delete
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

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? <Bell size={20} className="text-indigo-600" /> : <BellOff size={20} className="text-slate-400" />}
            <div>
              <div className="text-sm font-semibold text-slate-800">{t('pushLabel')}</div>
              <div className="text-xs text-slate-500">{t('pushDescription')}</div>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || !pushSupported || !configured}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              enabled ? 'bg-indigo-600' : 'bg-slate-300'
            } ${loading || !pushSupported || !configured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
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
