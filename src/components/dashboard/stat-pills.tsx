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
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center gap-3 hover:bg-amber-100 transition-colors cursor-pointer">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {t('streakInDanger', { days: streakDays })}
              </p>
              <p className="text-xs text-amber-600">
                {t('restoreFor', { points: restorePrice })}
              </p>
            </div>
            <span className="text-amber-400 text-sm">›</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-[1fr_2fr_1fr] gap-3">
        {/* Streak — clickable */}
        <Link href="/streak">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-slate-800">{streakDays}</span>
            {streakBonusPercent > 0 ? (
              <span className="text-[10px] text-indigo-600 font-medium">+{streakBonusPercent}%</span>
            ) : (
              <span className="text-[10px] text-slate-500">{t('streak')}</span>
            )}
          </div>
        </Link>

        {/* Level Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-800">Lv.{level} {levelTitle}</span>
            <span className="text-xs text-indigo-600 font-semibold">{progressPercent}%</span>
          </div>
          <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {nextLevel ? t('ptsToNext', { points: pointsToNext, title: nextLevel.title }) : t('maxLevel')}
          </p>
        </div>

        {/* Points */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <span className="text-2xl">💰</span>
          <span className="text-2xl font-bold text-slate-800">{balance.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500">{tc('pointsFull')}</span>
        </div>
      </div>
    </div>
  )
}
