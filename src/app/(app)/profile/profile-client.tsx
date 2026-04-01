'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heatmap } from '@/components/stats/heatmap'

type Category = { id: string; name: string; emoji: string }
type Purchase = {
  id: string
  purchasedAt: string
  redeemedAt: string | null
  pointsSpent: number
  item: { title: string; emoji: string; type: string }
}
type Level = { level: number; title: string; minPoints: number }
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: Category }

type Personal = {
  heatmap: Record<string, number>
  topTasks: { title: string; emoji: string; count: number }[]
  streak: number
  totalCompletions: number
  totalPointsEarned: number
  level: Level
  purchases: Purchase[]
}

type Comparison = {
  byWeek: Record<string, Record<string, number>>
  byCategory: Record<string, Record<string, number>>
  byMonth: Record<string, Record<string, number>>
}

type AchievementsSummary = {
  total: number
  unlocked: number
  previews: { id: string; emoji: string; unlocked: boolean }[]
}

export function ProfileClient({
  userName,
  personal,
  comparison: _comparison,
  categories,
  achievementsSummary,
  isOwnProfile,
  storeItems,
  tasks,
  userId,
}: {
  userName: string
  personal: Personal
  comparison?: Comparison
  categories: Category[]
  achievementsSummary: AchievementsSummary
  isOwnProfile: boolean
  storeItems?: StoreItem[]
  tasks?: Task[]
  userId?: string
}) {
  const router = useRouter()

  // --- Archive task ---
  async function archiveTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  // --- PIN change ---
  const [users, setUsers] = useState<{ id: string; name: string | null }[]>([])
  const [newPin, setNewPin] = useState<Record<string, string>>({})
  const [pinMsg, setPinMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOwnProfile) return
    fetch('/api/users')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Fehler'))))
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [isOwnProfile])

  async function changePin(uid: string) {
    const pin = newPin[uid]
    if (!pin || pin.length < 4) {
      setPinMsg((prev) => ({ ...prev, [uid]: 'Mindestens 4 Zeichen' }))
      return
    }
    const res = await fetch(`/api/users/${uid}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      setNewPin((prev) => ({ ...prev, [uid]: '' }))
      setPinMsg((prev) => ({ ...prev, [uid]: 'PIN geändert ✓' }))
    } else {
      setPinMsg((prev) => ({ ...prev, [uid]: 'Fehler' }))
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
              <div key={t.title} className="flex items-center gap-2">
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

      {/* Settings section — own profile only */}
      {isOwnProfile && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Einstellungen</h2>

          {/* Task management */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm">Aufgaben</h3>
            {(!tasks || tasks.length === 0) && (
              <p className="text-slate-400 text-sm">Keine aktiven Aufgaben.</p>
            )}
            {tasks?.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span>{t.emoji}</span>
                <span className="flex-1 text-sm">{t.title}</span>
                <span className="text-xs text-slate-400">{t.status}</span>
                <Button variant="outline" size="sm" onClick={() => archiveTask(t.id)}>
                  Archivieren
                </Button>
              </div>
            ))}
          </div>

          {/* Store items */}
          {storeItems && storeItems.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm">Store-Artikel</h3>
              {storeItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span>{item.emoji}</span>
                  <span className="flex-1 text-sm">{item.title}</span>
                  <span className="text-xs text-slate-400">{item.pointCost} Pkt</span>
                  <span className="text-xs text-slate-400">{item.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                </div>
              ))}
            </div>
          )}

          {/* PIN change */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm">PIN ändern</h3>
            {users.length === 0 && (
              <p className="text-slate-400 text-sm">Nutzer konnten nicht geladen werden.</p>
            )}
            {users.map((u) => (
              <div key={u.id} className="space-y-2">
                <Label>{u.name ?? 'Unbekannt'}</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Neuer PIN (min. 4 Zeichen)"
                    value={newPin[u.id] ?? ''}
                    onChange={(e) => setNewPin((prev) => ({ ...prev, [u.id]: e.target.value }))}
                  />
                  <Button onClick={() => changePin(u.id)} disabled={!newPin[u.id]}>
                    Ändern
                  </Button>
                </div>
                {pinMsg[u.id] && <p className="text-xs text-slate-500">{pinMsg[u.id]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
