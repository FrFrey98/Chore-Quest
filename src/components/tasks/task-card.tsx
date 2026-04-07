'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/toast-provider'
import { Check, Users } from 'lucide-react'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
  allowMultiple?: boolean; dailyLimit?: number | null
}

export function TaskCard({ task, onComplete, partnerId, partnerName }: {
  task: Task
  onComplete: (id: string) => Promise<void>
  partnerId?: string
  partnerName?: string
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [shared, setShared] = useState(false)
  const { toast } = useToast()
  const t = useTranslations('tasks')
  const tc = useTranslations('common')

  async function handleComplete() {
    setLoading(true)
    try {
      const isShared = shared && partnerId
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: isShared ? { 'Content-Type': 'application/json' } : undefined,
        body: isShared ? JSON.stringify({ withUserId: partnerId }) : undefined,
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error ?? t('completionFailed'))
      }
      const data = await res.json()
      setDone(true)
      setShared(false)

      const msg = isShared
        ? t('pointsEarnedTogether', { points: data.points, title: task.title })
        : t('pointsEarned', { points: data.points, title: task.title })
      toast(msg, 'success', {
        label: t('undo'),
        onClick: async () => {
          const undoRes = await fetch(`/api/tasks/${task.id}/complete/undo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completionId: data.id }),
          })
          if (undoRes.ok) {
            setDone(false)
            toast(t('undone'), 'info')
          } else {
            toast(t('undoFailed'), 'error')
          }
        },
      })

      if (data.newAchievements && data.newAchievements.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(t('achievementUnlocked', { emoji: a.emoji, title: a.title }), 'success')
          }, 1500 + i * 1500)
        })
      }

      onComplete(task.id).catch(() => {})
    } catch (err: any) {
      toast(err.message ?? t('completionFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (done) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
      <span className="text-2xl">{task.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{task.title}</p>
        {task.isRecurring && (
          <p className="text-xs text-slate-400">
            {task.recurringInterval === 'daily' ? t('recurring.daily')
              : task.recurringInterval === 'weekly' ? t('recurring.weekly')
              : t('recurring.monthly')}
          </p>
        )}
      </div>
      <Badge variant="secondary" className="text-indigo-700 bg-indigo-50 shrink-0">
        +{task.points} {tc('points')}
      </Badge>
      {partnerId && (
        <button
          onClick={() => setShared(!shared)}
          className={`p-1.5 rounded-lg transition-colors ${
            shared ? 'bg-amber-100 text-amber-700' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
          title={t('togetherWith', { name: partnerName ?? '' })}
        >
          <Users size={16} />
        </button>
      )}
      <Button size="sm" onClick={handleComplete} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
        {loading ? '…' : <><Check size={16} /> {shared ? `👫 ${t('together')}` : t('checkOff')}</>}
      </Button>
    </div>
  )
}
