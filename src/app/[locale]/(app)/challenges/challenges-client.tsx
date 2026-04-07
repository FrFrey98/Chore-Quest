'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'

type ChallengeEntry = {
  id: string
  currentProgress: number
  completedAt: string | null
  challenge: {
    id: string
    emoji: string
    title: string
    titleDe: string
    description: string
    descriptionDe: string
    targetValue: number
    bonusPoints: number
    weekStart: string
    weekEnd: string
  }
}

export function ChallengesClient({
  current,
  history,
}: {
  current: ChallengeEntry[]
  history: ChallengeEntry[]
}) {
  const t = useTranslations('challenges')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  // Group history by weekStart
  const historyByWeek = new Map<string, ChallengeEntry[]>()
  for (const entry of history) {
    const key = entry.challenge.weekStart
    if (!historyByWeek.has(key)) historyByWeek.set(key, [])
    historyByWeek.get(key)!.push(entry)
  }
  const sortedWeeks = [...historyByWeek.keys()].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t('heading')}</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'current'
              ? 'bg-indigo-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('thisWeek')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('history')}
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="flex flex-col gap-3">
          {current.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">{t('noChallenges')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('noChallengesSubtitle')}</p>
            </div>
          ) : (
            current.map((uc) => (
              <ChallengeCard key={uc.id} entry={uc} locale={locale} t={t} />
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          {sortedWeeks.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">{t('noChallenges')}</p>
            </div>
          ) : (
            sortedWeeks.map((weekKey) => {
              const entries = historyByWeek.get(weekKey)!
              const weekDate = new Date(weekKey).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
                month: 'short',
                day: 'numeric',
              })
              return (
                <div key={weekKey}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t('weekOf', { date: weekDate })}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {entries.map((uc) => (
                      <ChallengeCard key={uc.id} entry={uc} locale={locale} t={t} compact />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function ChallengeCard({
  entry,
  locale,
  t,
  compact,
}: {
  entry: ChallengeEntry
  locale: string
  t: ReturnType<typeof useTranslations<'challenges'>>
  compact?: boolean
}) {
  const ch = entry.challenge
  const isCompleted = entry.completedAt !== null
  const progress = Math.min(entry.currentProgress, ch.targetValue)
  const percent = ch.targetValue > 0 ? (progress / ch.targetValue) * 100 : 0
  const title = locale === 'de' ? ch.titleDe : ch.title
  const description = locale === 'de' ? ch.descriptionDe : ch.description

  return (
    <div
      className={`bg-card border border-border rounded-xl ${compact ? 'p-3' : 'p-4'} border-l-[3px] ${
        isCompleted ? 'border-l-green-500' : 'border-l-indigo-400'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={compact ? 'text-lg' : 'text-xl'}>{ch.emoji}</span>
        <span className={`flex-1 font-medium text-foreground truncate ${compact ? 'text-sm' : ''}`}>
          {title}
        </span>
        {isCompleted ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <CheckCircle2 size={14} /> {t('completed')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">
            {t('progress', { current: progress, target: ch.targetValue })}
          </span>
        )}
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground mb-2 ml-8">{description}</p>
      )}
      <div className={`h-1.5 bg-muted rounded-full overflow-hidden ${compact ? '' : 'ml-8'}`}>
        <div
          className={`h-full rounded-full transition-all ${
            isCompleted ? 'bg-green-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {isCompleted && (
        <p className={`text-xs text-green-600 font-semibold mt-1 ${compact ? '' : 'ml-8'}`}>
          {t('bonusPoints', { points: ch.bonusPoints })}
        </p>
      )}
    </div>
  )
}
