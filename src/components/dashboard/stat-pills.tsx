'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { type LevelDef } from '@/lib/config'

type StatPillsProps = {
  streakDays: number
  streakBonusPercent: number
  streakBonusName: string
  restoreAvailable: boolean
  restorePrice: number
  level: number
  levelTitle: string
  totalEarned: number
  balance: number
  levelDefinitions: LevelDef[]
}

export function StatPills({
  streakDays,
  streakBonusPercent,
  streakBonusName,
  restoreAvailable,
  restorePrice,
  level,
  levelTitle,
  totalEarned,
  balance,
  levelDefinitions,
}: StatPillsProps) {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const currentLevel = levelDefinitions.find((l) => l.level === level) ?? levelDefinitions[0]
  const nextLevel = levelDefinitions.find((l) => l.level === level + 1)
  const progressPercent = nextLevel
    ? Math.round(((totalEarned - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalEarned : 0

  return (
    <div className="space-y-2 mb-4">
      {restoreAvailable && (
        <Link href="/streak">
          <div className="bg-warning-muted border border-warning/30 rounded-xl p-3 flex items-center gap-3 hover:bg-warning/15 transition-colors cursor-pointer">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-warning">
                {t('streakInDanger', { days: streakDays })}
              </p>
              <p className="text-xs text-warning">
                {t('restoreFor', { points: restorePrice })}
              </p>
            </div>
            <span className="text-warning text-sm">›</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-[1fr_2fr_1fr] gap-3">
        {/* Streak — clickable */}
        <Link href="/streak">
          <div className="bg-card border border-border rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-foreground">{streakDays}</span>
            {streakBonusPercent > 0 ? (
              <span className="text-[10px] text-accent font-medium">+{streakBonusPercent}%</span>
            ) : (
              <span className="text-[10px] text-muted-foreground">{t('streak')}</span>
            )}
          </div>
        </Link>

        {/* Level Progress */}
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-foreground">Lv.{level} {levelTitle}</span>
            <span className="text-xs text-accent font-semibold">{progressPercent}%</span>
          </div>
          <div className="bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {nextLevel ? t('ptsToNext', { points: pointsToNext, title: nextLevel.title }) : t('maxLevel')}
          </p>
        </div>

        {/* Points */}
        <div className="bg-card border border-border rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <span className="text-2xl">💰</span>
          <span className="text-2xl font-bold text-foreground">{balance.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">{tc('pointsFull')}</span>
        </div>
      </div>
    </div>
  )
}
