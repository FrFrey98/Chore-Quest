'use client'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type ChallengeData = {
  id: string
  currentProgress: number
  completedAt: string | null
  challenge: {
    id: string
    emoji: string
    title: string
    titleDe: string
    targetValue: number
    bonusPoints: number
  }
}

export function ChallengesWidget({ challenges }: { challenges: ChallengeData[] }) {
  const t = useTranslations('challenges')
  const locale = useLocale()

  if (challenges.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground mb-2">
          {t('dashboardHeading')}
        </h2>
        <p className="text-sm text-muted-foreground text-center py-2">{t('noChallenges')}</p>
      </div>
    )
  }

  const displayed = challenges.slice(0, 3)

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground">
          {t('dashboardHeading')}
        </h2>
        <Link href="/challenges" className="text-xs text-accent hover:text-accent-hover transition-colors">
          {t('heading')} →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {displayed.map((uc) => {
          const ch = uc.challenge
          const isCompleted = uc.completedAt !== null
          const progress = Math.min(uc.currentProgress, ch.targetValue)
          const percent = ch.targetValue > 0 ? (progress / ch.targetValue) * 100 : 0
          const title = locale === 'de' ? ch.titleDe : ch.title

          return (
            <div
              key={uc.id}
              className={`p-3 rounded-lg border-l-[3px] ${
                isCompleted
                  ? 'bg-success-muted border-success'
                  : 'bg-muted/50 border-accent'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{ch.emoji}</span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">{title}</span>
                {isCompleted ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 size={14} /> {t('completed')}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t('progress', { current: progress, target: ch.targetValue })}
                  </span>
                )}
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isCompleted ? 'bg-success' : 'bg-accent'
                  }`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
              {isCompleted && (
                <p className="text-xs text-success font-semibold mt-1">
                  {t('bonusPoints', { points: ch.bonusPoints })}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
