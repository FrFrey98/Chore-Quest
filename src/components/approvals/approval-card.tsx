'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Approval = {
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
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{approval.task.emoji}</span>
        <div className="flex-1">
          <p className="font-medium">{approval.task.title}</p>
          <p className="text-sm text-slate-500">
            Von {approval.requestedBy.name ?? 'Unbekannt'} ·{' '}
            {approval.task.isRecurring
              ? `Wiederkehrend (${approval.task.recurringInterval === 'daily' ? 'täglich' : approval.task.recurringInterval === 'weekly' ? 'wöchentlich' : 'monatlich'})`
              : 'Einmalig'}
          </p>
        </div>
        <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded shrink-0">
          +{approval.task.points} Pkt
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => handle('reject')}
          disabled={loading !== null}
        >
          {loading === 'reject' ? '…' : '✗ Ablehnen'}
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={() => handle('approve')}
          disabled={loading !== null}
        >
          {loading === 'approve' ? '…' : '✓ Genehmigen'}
        </Button>
      </div>
    </div>
  )
}
