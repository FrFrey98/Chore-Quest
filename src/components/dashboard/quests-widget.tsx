'use client'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

type QuestWidgetData = {
  id: string
  title: string
  titleDe: string
  emoji: string
  currentStepOrder: number
  totalSteps: number
  currentStepTaskName: string
}

export function QuestsWidget({ quests }: { quests: QuestWidgetData[] }) {
  const t = useTranslations('quests')
  const locale = useLocale()

  if (quests.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground">
          {t('dashboardHeading')}
        </h2>
        <Link href="/quests" className="text-xs text-accent hover:text-accent-hover transition-colors">
          {t('heading')} →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {quests.map((q) => {
          const title = locale === 'de' ? q.titleDe : q.title
          const percent = q.totalSteps > 0 ? ((q.currentStepOrder - 1) / q.totalSteps) * 100 : 0

          return (
            <div key={q.id} className="p-3 rounded-lg border-l-[3px] border-accent bg-muted/50">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{q.emoji}</span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">{title}</span>
                <span className="text-xs text-muted-foreground">
                  {t('progress', { current: q.currentStepOrder, total: q.totalSteps })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5 ml-7 truncate">
                {t('currentStep')}: {q.currentStepTaskName}
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-7">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
