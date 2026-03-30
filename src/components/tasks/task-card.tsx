'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}

export function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleComplete() {
    setLoading(true)
    await onComplete(task.id)
    setDone(true)
    setLoading(false)
  }

  if (done) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
      <span className="text-2xl">{task.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{task.title}</p>
        {task.isRecurring && (
          <p className="text-xs text-slate-400">
            🔄 {task.recurringInterval === 'daily' ? 'Täglich'
              : task.recurringInterval === 'weekly' ? 'Wöchentlich'
              : 'Monatlich'}
          </p>
        )}
      </div>
      <Badge variant="secondary" className="text-indigo-700 bg-indigo-50 shrink-0">
        +{task.points} Pkt
      </Badge>
      <Button size="sm" onClick={handleComplete} disabled={loading}>
        {loading ? '…' : '✓'}
      </Button>
    </div>
  )
}
