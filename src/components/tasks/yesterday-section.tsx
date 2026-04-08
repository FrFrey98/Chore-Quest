'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Check, Users, Undo2 } from 'lucide-react'

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
}

type YesterdaySectionProps = {
  completed: CompletedTask[]
  due: DueTask[]
  partnerId?: string
  partnerName?: string
}

export function YesterdaySection({ completed, due, partnerId, partnerName }: YesterdaySectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('tasks')
  const ty = useTranslations('tasks.yesterday')
  const tc = useTranslations('common')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [sharedTaskId, setSharedTaskId] = useState<string | null>(null)
  const [undoingId, setUndoingId] = useState<string | null>(null)
  const [confirmUndoId, setConfirmUndoId] = useState<string | null>(null)

  async function handleComplete(task: DueTask) {
    setLoadingId(task.id)
    try {
      const isShared = sharedTaskId === task.id && partnerId
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: 'yesterday',
          ...(isShared ? { withUserId: partnerId } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      const data = await res.json()

      setDoneIds((prev) => new Set(prev).add(task.id))
      setSharedTaskId(null)

      toast(ty('pointsEarned', { points: data.points, title: task.title }), 'success')

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(t('achievementUnlocked', { emoji: a.emoji, title: a.title }), 'success')
          }, 1500 + i * 1500)
        })
      }

      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : ty('catchUpFailed'), 'error')
    } finally {
      setLoadingId(null)
    }
  }

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
      toast(t('undone'), 'info')
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : t('undoFailed'), 'error')
    } finally {
      setUndoingId(null)
      setConfirmUndoId(null)
    }
  }

  const pendingDue = due.filter((d) => !doneIds.has(d.id))
  const hasContent = completed.length > 0 || due.length > 0

  return (
    <div className="space-y-4">
      {/* Completed yesterday */}
      {completed.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{ty('completed')}</h2>
          <div className="flex flex-col gap-2">
            {completed.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 bg-success-muted rounded-lg border-l-[3px] border-success">
                <span className="text-lg">{c.emoji}</span>
                <span className="flex-1 text-sm text-muted-foreground line-through truncate">{c.title}</span>
                <span className="text-xs text-success font-semibold">✓ +{c.points}</span>
                {confirmUndoId === c.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUndo(c)}
                      disabled={undoingId === c.id}
                      className="text-xs text-danger font-semibold hover:text-danger"
                    >
                      {undoingId === c.id ? '…' : tc('yes')}
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
                    onClick={() => setConfirmUndoId(c.id)}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
                    title={t('undo')}
                  >
                    <Undo2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due yesterday — backfill */}
      {pendingDue.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{ty('catchUp')}</h2>
          <div className="flex flex-col gap-2">
            {pendingDue.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2.5 bg-warning-muted rounded-lg border-l-[3px] border-warning">
                <span className="text-lg">{task.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate block">{task.title}</span>
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
                  onClick={() => handleComplete(task)}
                  disabled={loadingId === task.id}
                  className="flex items-center gap-1 bg-warning hover:bg-warning text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {loadingId === task.id ? '…' : <><Check size={14} /> {sharedTaskId === task.id ? `👫 ${t('together')}` : ty('catchUpAction')}</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">{ty('noTasks')}</p>
        </div>
      )}
    </div>
  )
}
