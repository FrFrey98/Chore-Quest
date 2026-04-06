'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, BellOff } from 'lucide-react'
import { Heatmap } from '@/components/stats/heatmap'
import { useToast } from '@/components/toast-provider'

type Purchase = {
  id: string
  purchasedAt: string
  redeemedAt: string | null
  pointsSpent: number
  item: { title: string; emoji: string; type: string }
}
type Level = { level: number; title: string; minPoints: number }

type Personal = {
  heatmap: Record<string, number>
  topTasks: { id: string; title: string; emoji: string; count: number }[]
  streak: number
  totalCompletions: number
  totalPointsEarned: number
  level: Level
  purchases: Purchase[]
}

type AchievementsSummary = {
  total: number
  unlocked: number
  previews: { id: string; emoji: string; unlocked: boolean }[]
}

export function ProfileClient({
  userName,
  userId,
  personal,
  achievementsSummary,
  isOwnProfile,
  notificationsEnabled,
  vapidPublicKey,
}: {
  userName: string
  userId: string
  personal: Personal
  achievementsSummary: AchievementsSummary
  isOwnProfile: boolean
  notificationsEnabled: boolean
  vapidPublicKey: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()

  // PIN change state
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  // Notification state
  const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled)
  const [notifLoading, setNotifLoading] = useState(false)

  const pushSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
  const configured = !!vapidPublicKey

  async function handlePinChange() {
    setPinMsg('')
    if (!currentPin) { setPinMsg('Aktueller PIN erforderlich'); return }
    if (!/^\d{4,8}$/.test(newPin)) {
      setPinMsg('PIN muss 4-8 Ziffern lang sein')
      return
    }
    const res = await fetch(`/api/users/${userId}/pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: newPin, currentPin }),
    })
    if (res.ok) {
      setCurrentPin('')
      setNewPin('')
      setPinMsg('PIN geändert ✓')
    } else {
      const d = await res.json()
      setPinMsg(d.error ?? 'Fehler')
    }
  }

  async function handleNotifToggle() {
    if (!pushSupported) {
      toast('Push-Benachrichtigungen werden von diesem Browser nicht unterstützt', 'error')
      return
    }
    if (!configured) {
      toast('Push ist serverseitig nicht konfiguriert', 'error')
      return
    }

    setNotifLoading(true)
    try {
      if (!notifEnabled) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          toast('Browser-Berechtigung für Benachrichtigungen benötigt', 'error')
          setNotifLoading(false)
          return
        }

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
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
          throw new Error(data.error ?? 'Fehler')
        }

        setNotifEnabled(true)
        toast('Benachrichtigungen aktiviert', 'success')
      } else {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
        }

        await fetch('/api/notifications/push/subscribe', { method: 'DELETE' })
        setNotifEnabled(false)
        toast('Benachrichtigungen deaktiviert', 'info')
      }
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Fehler', 'error')
    } finally {
      setNotifLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{userName}</h1>
            <p className="text-sm text-slate-500">
              Level {personal.level.level} · {personal.level.title}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-400">Punkte</p>
            <p className="font-bold text-indigo-700">{personal.totalPointsEarned.toLocaleString()}</p>
          </div>
          {isOwnProfile && (
            <Link href="/settings" className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <span>🔥</span>
            <span className="font-semibold">{personal.streak}</span>
            <span className="text-slate-400">Tage</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <span>✓</span>
            <span className="font-semibold">{personal.totalCompletions}</span>
            <span className="text-slate-400">Aufgaben</span>
          </div>
        </div>

        {/* Achievements preview */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {achievementsSummary.previews.slice(0, 8).map((a) => (
              <span
                key={a.id}
                className={`text-lg ${a.unlocked ? '' : 'opacity-25 grayscale'}`}
                title={a.unlocked ? 'Freigeschaltet' : 'Noch gesperrt'}
              >
                {a.emoji}
              </span>
            ))}
          </div>
          <Link
            href="/achievements"
            className="text-xs text-indigo-600 ml-auto hover:underline"
          >
            {achievementsSummary.unlocked}/{achievementsSummary.total} →
          </Link>
        </div>
      </div>

      {/* Stats section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Statistiken</h2>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Aufgaben', value: personal.totalCompletions },
            { label: 'Punkte verdient', value: personal.totalPointsEarned.toLocaleString() },
            { label: '🔥 Streak', value: `${personal.streak} Tage` },
            { label: 'Level', value: `${personal.level.level} · ${personal.level.title}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-bold text-indigo-700">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Aktivitäts-Heatmap
          </p>
          <Heatmap data={personal.heatmap} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Top Aufgaben
          </p>
          <div className="space-y-2">
            {personal.topTasks.length === 0 && (
              <p className="text-slate-400 text-sm">Noch keine Aufgaben erledigt.</p>
            )}
            {personal.topTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span>{t.emoji}</span>
                <span className="text-sm flex-1">{t.title}</span>
                <span className="text-sm font-bold text-indigo-600">{t.count}×</span>
              </div>
            ))}
          </div>
        </div>

        {isOwnProfile && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Belohnungs-Historie
            </p>
            {personal.purchases.length === 0 ? (
              <p className="text-slate-400 text-sm">Noch keine Käufe.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2">Artikel</th>
                    <th className="text-right pb-2">Datum</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.purchases.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2">
                        {p.item.emoji} {p.item.title}
                      </td>
                      <td className="py-2 text-right text-slate-500 text-xs">
                        {new Date(p.purchasedAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-2 text-right">
                        {p.redeemedAt ? (
                          <span className="text-green-600 text-xs">Eingelöst</span>
                        ) : p.item.type === 'real_reward' ? (
                          <span className="text-amber-500 text-xs">Ausstehend</span>
                        ) : (
                          <span className="text-indigo-600 text-xs">✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* PIN change section */}
      {isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Sicherheit</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">PIN ändern</p>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4,8}"
              maxLength={8}
              placeholder="Aktueller PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4,8}"
                maxLength={8}
                placeholder="Neuer PIN (4-8 Ziffern)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={handlePinChange}
                disabled={!newPin || !currentPin}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ändern
              </button>
            </div>
            {pinMsg && (
              <p className={`text-xs ${pinMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {pinMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notifications section */}
      {isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Benachrichtigungen</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifEnabled ? <Bell size={20} className="text-indigo-600" /> : <BellOff size={20} className="text-slate-400" />}
                <div>
                  <div className="text-sm font-semibold text-slate-800">Push-Benachrichtigungen</div>
                  <div className="text-xs text-slate-500">Erinnerung wenn Aufgaben mit Uhrzeit fällig sind</div>
                </div>
              </div>
              <button
                onClick={handleNotifToggle}
                disabled={notifLoading || !pushSupported || !configured}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  notifEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                } ${notifLoading || !pushSupported || !configured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  notifEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {!pushSupported && (
              <p className="text-xs text-amber-600 mt-2">Dieser Browser unterstützt keine Push-Benachrichtigungen.</p>
            )}
            {pushSupported && !configured && (
              <p className="text-xs text-amber-600 mt-2">Push ist serverseitig nicht konfiguriert (VAPID-Keys fehlen).</p>
            )}
          </div>
        </div>
      )}
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
