'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type StreakClientProps = {
  currentStreak: number
  bestStreak: number
  restoreCount: number
  tierName: string
  tierPercent: number
  nextTier: { name: string; percent: number; daysNeeded: number } | null
  restore: { available: boolean; price: number }
  balance: number
  tiers: { minDays: number; percent: number; name: string }[]
  heatmap: Record<string, number>
}

export function StreakClient({
  currentStreak,
  bestStreak,
  restoreCount,
  tierName,
  tierPercent,
  nextTier,
  restore,
  balance,
  tiers,
  heatmap,
}: StreakClientProps) {
  const router = useRouter()
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  async function handleRestore() {
    setRestoring(true)
    setRestoreError(null)
    try {
      const res = await fetch('/api/streak/restore', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setRestoreError(data.error ?? 'Fehler bei der Wiederherstellung')
        return
      }
      router.refresh()
    } catch {
      setRestoreError('Netzwerkfehler')
    } finally {
      setRestoring(false)
    }
  }

  // Generate heatmap for last 12 weeks
  const today = new Date()
  const weeks: { date: string; value: number }[][] = []
  for (let w = 11; w >= 0; w--) {
    const week: { date: string; value: number }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setUTCDate(date.getUTCDate() - (w * 7 + (6 - d)))
      const key = date.toISOString().slice(0, 10)
      week.push({ date: key, value: heatmap[key] ?? 0 })
    }
    weeks.push(week)
  }

  function heatColor(value: number): string {
    if (value === 0) return 'bg-slate-100'
    if (value < 20) return 'bg-indigo-200'
    if (value < 50) return 'bg-indigo-300'
    if (value < 100) return 'bg-indigo-400'
    return 'bg-indigo-500'
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/" className="text-sm text-indigo-500 hover:text-indigo-700">
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <span className="text-5xl">🔥</span>
        <p className="text-4xl font-bold text-slate-800 mt-2">{currentStreak} Tage</p>
        {tierPercent > 0 ? (
          <p className="text-indigo-600 font-medium mt-1">{tierName} · +{tierPercent}% Bonus</p>
        ) : (
          <p className="text-slate-500 mt-1">Noch kein Bonus aktiv</p>
        )}
      </div>

      {/* Restore Alert */}
      {restore.available && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Deine Streak ist in Gefahr!
          </p>
          <p className="text-xs text-amber-600 mb-3">
            Du hast gestern keine Aufgabe erledigt. Stelle deine {currentStreak}-Tage-Streak
            für {restore.price} Punkte wieder her. Du musst danach heute noch eine Aufgabe
            erledigen, um die Streak fortzuführen.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestore}
              disabled={restoring || balance < restore.price}
              className="bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {restoring ? 'Wird wiederhergestellt...' : `Wiederherstellen (${restore.price} Pkt)`}
            </button>
            <span className="text-xs text-amber-600">
              Guthaben: {balance} Punkte
            </span>
          </div>
          {balance < restore.price && (
            <p className="text-xs text-red-600 mt-2">Nicht genug Punkte!</p>
          )}
          {restoreError && (
            <p className="text-xs text-red-600 mt-2">{restoreError}</p>
          )}
        </div>
      )}

      {/* Next Tier Progress */}
      {nextTier && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-800">Nächste Stufe</span>
            <span className="text-xs text-indigo-600 font-medium">{nextTier.name} (+{nextTier.percent}%)</span>
          </div>
          <div className="bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all"
              style={{
                width: `${Math.round(
                  ((currentStreak - (tiers.find((t) => t.percent < nextTier.percent && t.minDays <= currentStreak)?.minDays ?? 0)) /
                    (nextTier.daysNeeded + currentStreak - (tiers.find((t) => t.percent < nextTier.percent && t.minDays <= currentStreak)?.minDays ?? 0))) *
                    100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Noch {nextTier.daysNeeded} {nextTier.daysNeeded === 1 ? 'Tag' : 'Tage'}
          </p>
        </div>
      )}

      {/* Bonus Tiers Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Bonus-Stufen</h2>
        <div className="space-y-2">
          {tiers.map((t) => {
            const isActive = t.name === tierName
            return (
              <div
                key={t.minDays}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'
                }`}
              >
                <span>
                  {isActive && '► '}{t.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">ab {t.minDays} Tage</span>
                  <span className={`font-medium ${isActive ? 'text-indigo-600' : ''}`}>
                    +{t.percent}%
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak History */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Streak-Historie</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{bestStreak}</p>
            <p className="text-xs text-slate-500">Beste Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{restoreCount}</p>
            <p className="text-xs text-slate-500">Wiederherstellungen</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Aktivität (12 Wochen)</h2>
        <div className="flex gap-1 justify-center">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${heatColor(day.value)}`}
                  title={`${day.date}: ${day.value} Punkte`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">So funktioniert die Streak</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Erledige jeden Tag mindestens eine Aufgabe, um deine Streak zu halten.
          Bei aktiver Streak erhältst du Bonus-Punkte auf jede erledigte Aufgabe.
          Je länger deine Streak, desto höher der Bonus! Falls du einen Tag verpasst,
          kannst du deine Streak am Folgetag gegen Punkte wiederherstellen — aber du musst
          danach trotzdem noch eine Aufgabe am selben Tag erledigen.
        </p>
      </div>
    </div>
  )
}
