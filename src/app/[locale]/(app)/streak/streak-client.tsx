'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('streak')
  const tc = useTranslations('common')
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  async function handleRestore() {
    setRestoring(true)
    setRestoreError(null)
    try {
      const res = await fetch('/api/streak/restore', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setRestoreError(data.error ?? t('inDanger.failed'))
        return
      }
      router.refresh()
    } catch {
      setRestoreError(tc('networkError'))
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
    if (value === 0) return 'bg-muted'
    if (value < 20) return 'bg-accent/20'
    if (value < 50) return 'bg-accent/40'
    if (value < 100) return 'bg-accent/60'
    return 'bg-accent'
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/" className="text-sm text-accent hover:text-accent-hover">
        {t('backToDashboard')}
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <span className="text-5xl">🔥</span>
        <p className="text-4xl font-bold text-foreground mt-2">{t('counter', { days: currentStreak })}</p>
        {tierPercent > 0 ? (
          <p className="text-accent font-medium mt-1">{tierName} · {t('nextTierBonus', { percent: tierPercent })}</p>
        ) : (
          <p className="text-muted-foreground mt-1">{t('noBonusActive')}</p>
        )}
      </div>

      {/* Restore Alert */}
      {restore.available && (
        <div className="bg-warning-muted border border-warning/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-warning mb-1">
            {t('inDanger.heading')}
          </p>
          <p className="text-xs text-warning mb-3">
            {t('inDanger.body', { days: currentStreak, price: restore.price })}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestore}
              disabled={restoring || balance < restore.price}
              className="bg-warning text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-warning disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {restoring ? t('inDanger.restoring') : t('inDanger.restoreButton', { price: restore.price })}
            </button>
            <span className="text-xs text-warning">
              {t('inDanger.balance', { balance })}
            </span>
          </div>
          {balance < restore.price && (
            <p className="text-xs text-danger mt-2">{t('inDanger.notEnough')}</p>
          )}
          {restoreError && (
            <p className="text-xs text-danger mt-2">{restoreError}</p>
          )}
        </div>
      )}

      {/* Next Tier Progress */}
      {nextTier && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">{t('nextTier')}</span>
            <span className="text-xs text-accent font-medium">{nextTier.name} ({t('nextTierBonus', { percent: nextTier.percent })})</span>
          </div>
          <div className="bg-accent rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all"
              style={{
                width: `${Math.round(
                  ((currentStreak - (tiers.find((ti) => ti.percent < nextTier.percent && ti.minDays <= currentStreak)?.minDays ?? 0)) /
                    (nextTier.daysNeeded + currentStreak - (tiers.find((ti) => ti.percent < nextTier.percent && ti.minDays <= currentStreak)?.minDays ?? 0))) *
                    100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('daysRemaining', { count: nextTier.daysNeeded })}
          </p>
        </div>
      )}

      {/* Bonus Tiers Table */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('tiers.heading')}</h2>
        <div className="space-y-2">
          {tiers.map((tier) => {
            const isActive = tier.name === tierName
            return (
              <div
                key={tier.minDays}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground'
                }`}
              >
                <span>
                  {isActive && '► '}{tier.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{t('tiers.fromDays', { days: tier.minDays })}</span>
                  <span className={`font-medium ${isActive ? 'text-accent' : ''}`}>
                    +{tier.percent}%
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak History */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('history.heading')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{bestStreak}</p>
            <p className="text-xs text-muted-foreground">{t('history.best')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{restoreCount}</p>
            <p className="text-xs text-muted-foreground">{t('history.restoreCount')}</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('history.activityHeading')}</h2>
        <div className="flex gap-1 justify-center">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${heatColor(day.value)}`}
                  title={t('history.tooltip', { date: day.date, value: day.value })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-muted/50 border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">{t('howItWorks.heading')}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('howItWorks.body')}
        </p>
      </div>
    </div>
  )
}
