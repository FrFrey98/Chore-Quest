'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { CheckCircle2 } from 'lucide-react'

type QuestStep = {
  id: string
  stepOrder: number
  description: string
  descriptionDe: string
  task: { id: string; title: string; emoji: string }
}

type QuestData = {
  id: string
  title: string
  titleDe: string
  description: string
  descriptionDe: string
  emoji: string
  bonusPoints: number
  steps: QuestStep[]
  userQuest: {
    id: string
    currentStepOrder: number
    startedAt: string
    completedAt: string | null
    completedStepIds: string[]
  } | null
}

export function QuestsClient({ quests }: { quests: QuestData[] }) {
  const t = useTranslations('quests')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available')

  const available = quests.filter((q) => !q.userQuest)
  const active = quests.filter((q) => q.userQuest && !q.userQuest.completedAt)
  const completed = quests.filter((q) => q.userQuest?.completedAt)

  const tabs = [
    { key: 'available' as const, label: t('available'), count: available.length },
    { key: 'active' as const, label: t('active'), count: active.length },
    { key: 'completed' as const, label: t('completed'), count: completed.length },
  ]

  const currentList = activeTab === 'available' ? available : activeTab === 'active' ? active : completed

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t('heading')}</h1>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {currentList.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">{t('noQuests')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('noQuestsSubtitle')}</p>
          </div>
        ) : (
          currentList.map((quest) => (
            <QuestCard key={quest.id} quest={quest} locale={locale} tab={activeTab} />
          ))
        )}
      </div>
    </div>
  )
}

function QuestCard({
  quest,
  locale,
  tab,
}: {
  quest: QuestData
  locale: string
  tab: 'available' | 'active' | 'completed'
}) {
  const t = useTranslations('quests')
  const { toast } = useToast()
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)

  const title = locale === 'de' ? quest.titleDe : quest.title
  const description = locale === 'de' ? quest.descriptionDe : quest.description
  const isCompleted = quest.userQuest?.completedAt !== null && quest.userQuest?.completedAt !== undefined

  async function handleAccept() {
    setAccepting(true)
    try {
      const res = await fetch(`/api/quests/${quest.id}/accept`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to accept')
      }
      toast(t('accepted'), 'success')
      router.refresh()
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div
      className={`bg-card border border-border rounded-xl p-4 border-l-[3px] ${
        isCompleted
          ? 'border-l-green-500'
          : quest.userQuest
          ? 'border-l-indigo-400'
          : 'border-l-muted-foreground/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{quest.emoji}</span>
        <span className="flex-1 font-medium text-foreground truncate">{title}</span>
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <CheckCircle2 size={14} /> {t('completed')}
          </span>
        )}
        {tab === 'active' && quest.userQuest && (
          <span className="text-xs text-muted-foreground font-medium">
            {t('progress', { current: quest.userQuest.currentStepOrder, total: quest.steps.length })}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3 ml-8">{description}</p>

      {/* Steps */}
      <div className="ml-8 flex flex-col gap-1.5 mb-3">
        {quest.steps.map((step) => {
          const stepDesc = locale === 'de' ? step.descriptionDe : step.description
          const isStepCompleted = quest.userQuest?.completedStepIds.includes(step.id) ?? false
          const isCurrent = quest.userQuest && !isCompleted && quest.userQuest.currentStepOrder === step.stepOrder

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${
                isStepCompleted
                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400'
                  : isCurrent
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800'
                  : 'text-muted-foreground'
              }`}
            >
              {isStepCompleted ? (
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current shrink-0" />
              )}
              <span className="font-medium">{t('step', { n: step.stepOrder })}</span>
              <span className="truncate">
                {step.task.emoji} {step.task.title} — {stepDesc}
              </span>
              {isCurrent && (
                <span className="ml-auto text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {t('currentStep')}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="ml-8 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {t('bonusOnComplete', { points: quest.bonusPoints })}
        </span>
        {tab === 'available' && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {accepting ? '...' : t('accept')}
          </button>
        )}
        {isCompleted && (
          <span className="text-xs text-green-600 font-semibold">
            +{quest.bonusPoints} Pts ✓
          </span>
        )}
      </div>

      {/* Progress bar for active quests */}
      {tab === 'active' && quest.userQuest && (
        <div className="ml-8 mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${((quest.userQuest.completedStepIds.length) / quest.steps.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}
