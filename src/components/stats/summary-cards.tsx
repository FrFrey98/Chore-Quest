'use client'

import { useTranslations } from 'next-intl'

type SummaryCardsProps = {
  taskCount: number
  totalPoints: number
  avgPerDay: number
}

export function SummaryCards({ taskCount, totalPoints, avgPerDay }: SummaryCardsProps) {
  const t = useTranslations('stats.summary')
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-foreground">{taskCount}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('completedTasks')}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('earnedPoints')}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-foreground">{avgPerDay.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('tasksPerDay')}</p>
      </div>
    </div>
  )
}
