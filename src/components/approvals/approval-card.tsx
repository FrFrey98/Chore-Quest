'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export type Approval = {
  id: string
  task: { title: string; emoji: string; points: number; isRecurring: boolean; recurringInterval: string | null }
  requestedBy: { name: string | null }
}

export function ApprovalCard({
  approval,
  onAction,
}: {
  approval: Approval
  onAction: (id: string, action: 'approve' | 'reject') => Promise<void>
}) {
  const t = useTranslations('approvals.card')
  const tc = useTranslations('common')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState(false)

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      await onAction(approval.id, action)
      setDone(true)
    } catch {
      // keep card visible on failure
    } finally {
      setLoading(null)
    }
  }

  if (done) return null

  return (
    <div className="bg-card rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{approval.task.emoji}</span>
        <div className="flex-1">
          <p className="font-medium">{approval.task.title}</p>
          <p className="text-sm text-muted-foreground">
            {t('from', { name: approval.requestedBy.name ?? tc('unknown') })}{' '}
            {approval.task.isRecurring
              ? (approval.task.recurringInterval === 'daily' ? t('recurringDaily')
                  : approval.task.recurringInterval === 'weekly' ? t('recurringWeekly')
                  : approval.task.recurringInterval === 'monthly' ? t('recurringMonthly')
                  : t('recurringUnknown'))
              : t('oneTime')}
          </p>
        </div>
        <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-0.5 rounded shrink-0">
          +{approval.task.points} {tc('points')}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-danger/20 text-danger hover:bg-danger-muted"
          onClick={() => handle('reject')}
          disabled={loading !== null}
        >
          {loading === 'reject' ? '…' : t('reject')}
        </Button>
        <Button
          className="flex-1 bg-success hover:bg-success"
          onClick={() => handle('approve')}
          disabled={loading !== null}
        >
          {loading === 'approve' ? '…' : t('approve')}
        </Button>
      </div>
    </div>
  )
}
