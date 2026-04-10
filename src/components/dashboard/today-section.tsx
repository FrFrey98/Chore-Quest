'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Check, Users, Undo2 } from 'lucide-react'
import { HealthBar } from '@/components/tasks/health-bar'
import { getDecayHours } from '@/lib/health'
import { TrainingLogModal } from '@/components/dogs/training-log-modal'

export type DogTrainingContext = {
  dogs: Array<{ id: string; name: string }>
  allSkills: Array<{
    id: string
    nameDe: string
    nameEn: string
    categoryId: string
    categoryNameDe: string
  }>
  householdUsers: Array<{ id: string; name: string }>
  dailyChallengesByDogId: Record<string, { maintenance: { skillDefinitionId: string } | null; progression: { skillDefinitionId: string } | null; discovery: { skillDefinitionId: string } | null } | null>
  pointsEarnedTodayByDogId?: Record<string, number>
}

type CompletedTask = {
  id: string
  taskId: string
  emoji: string
  title: string
  points: number
}

type DueTask = {
  id: string
  emoji: string
  title: string
  points: number
  allowMultiple: boolean
  dailyLimit: number | null
  todayCount: number
  nextDueAt?: string | null
  decayHours?: number | null
  recurringInterval?: string | null
  categoryId?: string | null
  isSystem?: boolean
  dogId?: string | null
}

type SuggestedTask = {
  id: string
  emoji: string
  title: string
}

type TodaySectionProps = {
  completed: CompletedTask[]
  due: DueTask[]
  suggestions: SuggestedTask[]
  partnerId?: string
  partnerName?: string
  decayHoursByInterval?: Record<string, number>
  vacationStart?: string | null
  vacationEnd?: string | null
  dogTrainingContext?: DogTrainingContext | null
  currentUserId?: string
}

export function TodaySection({ completed, due, suggestions, partnerId, partnerName, decayHoursByInterval, vacationStart, vacationEnd, dogTrainingContext, currentUserId }: TodaySectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const tCh = useTranslations('challenges')
  const tQ = useTranslations('quests')
  const locale = useLocale()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [sharedTaskId, setSharedTaskId] = useState<string | null>(null)
  const [undoingId, setUndoingId] = useState<string | null>(null)
  const [confirmUndoId, setConfirmUndoId] = useState<string | null>(null)
  const [trainingModal, setTrainingModal] = useState<{ dogId: string; dogName: string } | null>(null)

  async function handleUndo(completion: CompletedTask) {
    setUndoingId(completion.id)
    try {
      const res = await fetch(`/api/tasks/${completion.taskId}/complete/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionId: completion.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      setConfirmUndoId(null)
      toast(t('undone'), 'info')
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : t('undoFailed'), 'error')
    } finally {
      setUndoingId(null)
      setConfirmUndoId(null)
    }
  }

  const totalTasks = completed.length + due.length
  const doneCount = completed.length + doneIds.size

  function isDogTrainingTask(task: DueTask): boolean {
    return task.categoryId === 'dog_training' && task.isSystem === true
  }

  function handleDogTrainingClick(task: DueTask) {
    if (!dogTrainingContext) return
    // Prefer dogId field; fall back to parsing title for older tasks without dogId
    let dog = task.dogId
      ? dogTrainingContext.dogs.find((d) => d.id === task.dogId)
      : null
    if (!dog) {
      const match = task.title.match(/^🐕 (.+) trainieren$/)
      const dogName = match?.[1] ?? null
      dog = dogName ? dogTrainingContext.dogs.find((d) => d.name === dogName) : null
    }
    if (!dog) return
    setTrainingModal({ dogId: dog.id, dogName: dog.name })
  }

  async function handleComplete(task: DueTask) {
    setLoadingId(task.id)
    try {
      const isShared = sharedTaskId === task.id && partnerId
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: isShared ? { 'Content-Type': 'application/json' } : undefined,
        body: isShared ? JSON.stringify({ withUserId: partnerId }) : undefined,
      })
      const data = await res.json()

      // Handle offline queued completion
      if (data.queued) {
        if (!task.allowMultiple) {
          setDoneIds((prev) => new Set(prev).add(task.id))
        }
        setSharedTaskId(null)
        toast(t('syncing', { title: task.title }), 'info')
        return
      }

      if (!res.ok) {
        throw new Error(data.error ?? tc('error'))
      }

      if (!task.allowMultiple) {
        setDoneIds((prev) => new Set(prev).add(task.id))
      }
      setSharedTaskId(null)

      const toastMsg = isShared
        ? t('pointsEarnedTogether', { points: data.points, title: task.title })
        : t('pointsEarned', { points: data.points, title: task.title })
      toast(toastMsg, 'success')

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(t('achievementUnlocked', { emoji: a.emoji, title: a.title }), 'success')
          }, 1500 + i * 1500)
        })
      }

      if (data.completedChallenges?.length) {
        const achDelay = (data.newAchievements?.length ?? 0) * 1500
        data.completedChallenges.forEach((ch: { emoji: string; title: string; titleDe: string }, i: number) => {
          setTimeout(() => {
            const chTitle = locale === 'de' ? ch.titleDe : ch.title
            toast(tCh('challengeCompleted', { emoji: ch.emoji, title: chTitle }), 'success')
          }, 1500 + achDelay + i * 1500)
        })
      }

      if (data.completedQuests?.length) {
        const prevDelay = 1500 + ((data.newAchievements?.length ?? 0) + (data.completedChallenges?.length ?? 0)) * 1500
        data.completedQuests.forEach((q: { emoji: string; title: string; titleDe: string }, i: number) => {
          setTimeout(() => {
            const qTitle = locale === 'de' ? q.titleDe : q.title
            toast(tQ('questCompleted', { emoji: q.emoji, title: qTitle }), 'success')
          }, prevDelay + i * 1500)
        })
      }

      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : t('completionFailed'), 'error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground">{t('today')}</h2>
        <span className="bg-success-muted text-success text-xs font-semibold rounded-full px-2 py-0.5">
          {t('doneOfTotal', { done: doneCount, total: totalTasks })}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {/* Completed tasks */}
        {completed.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2.5 bg-success-muted rounded-lg border-l-[3px] border-success">
            <span className="text-lg">{task.emoji}</span>
            <span className="flex-1 text-sm text-muted-foreground line-through truncate">{task.title}</span>
            <span className="text-xs text-success font-semibold">✓ +{task.points}</span>
            {confirmUndoId === task.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUndo(task)}
                  disabled={undoingId === task.id}
                  className="text-xs text-danger font-semibold hover:text-danger"
                >
                  {undoingId === task.id ? '…' : tc('yes')}
                </button>
                <button
                  onClick={() => setConfirmUndoId(null)}
                  className="text-xs text-muted-foreground hover:text-muted-foreground"
                >
                  {tc('no')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmUndoId(task.id)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
                title={t('undoConfirm')}
              >
                <Undo2 size={14} />
              </button>
            )}
          </div>
        ))}
        {/* Due tasks */}
        {due.filter((task) => !doneIds.has(task.id)).map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg border-l-[3px] border-border">
            <span className="text-lg">{task.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground truncate block">{task.title}</span>
              {task.allowMultiple && task.dailyLimit && (
                <span className="text-[10px] text-muted-foreground">{task.todayCount}/{task.dailyLimit} {t('today').toLowerCase()}</span>
              )}
              {decayHoursByInterval && (
                <HealthBar
                  nextDueAt={task.nextDueAt ?? null}
                  decayHours={getDecayHours(task.decayHours, task.recurringInterval, decayHoursByInterval)}
                  vacationStart={vacationStart}
                  vacationEnd={vacationEnd}
                />
              )}
            </div>
            {partnerId && (
              <button
                onClick={() => setSharedTaskId(sharedTaskId === task.id ? null : task.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  sharedTaskId === task.id
                    ? 'bg-warning-muted text-warning'
                    : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted'
                }`}
                title={t('togetherWith', { name: partnerName ?? '' })}
              >
                <Users size={14} />
              </button>
            )}
            <button
              onClick={() => isDogTrainingTask(task) ? handleDogTrainingClick(task) : handleComplete(task)}
              disabled={loadingId === task.id}
              className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {loadingId === task.id ? '…' : <><Check size={14} /> {sharedTaskId === task.id ? `👫 ${t('together')}` : t('checkOff')}</>}
            </button>
          </div>
        ))}
        {/* Suggested tasks */}
        {suggestions.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2.5 bg-warning-muted rounded-lg border-l-[3px] border-warning opacity-70">
            <span className="text-lg">{task.emoji}</span>
            <span className="flex-1 text-sm text-warning truncate">{task.title}</span>
            <span className="text-[10px] text-warning font-semibold">{t('suggestion')}</span>
          </div>
        ))}
        {/* Empty state */}
        {completed.length === 0 && due.length === 0 && suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">{t('noTasksToday')}</p>
        )}
      </div>

      {dogTrainingContext && trainingModal && currentUserId && (
        <TrainingLogModal
          open={!!trainingModal}
          onOpenChange={(open) => { if (!open) setTrainingModal(null) }}
          dogId={trainingModal.dogId}
          dogName={trainingModal.dogName}
          allDogs={dogTrainingContext.dogs}
          allSkills={dogTrainingContext.allSkills}
          recommendedSkillIds={[
            dogTrainingContext.dailyChallengesByDogId[trainingModal.dogId]?.maintenance?.skillDefinitionId,
            dogTrainingContext.dailyChallengesByDogId[trainingModal.dogId]?.progression?.skillDefinitionId,
            dogTrainingContext.dailyChallengesByDogId[trainingModal.dogId]?.discovery?.skillDefinitionId,
          ].filter((id): id is string => !!id)}
          householdUsers={dogTrainingContext.householdUsers}
          pointsEarnedTodayForDog={dogTrainingContext.pointsEarnedTodayByDogId?.[trainingModal.dogId] ?? 0}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
