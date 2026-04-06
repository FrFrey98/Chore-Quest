'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TaskRow } from '@/components/manage/task-row'
import { RewardRow } from '@/components/manage/reward-row'

type Task = {
  id: string
  title: string
  emoji: string
  points: number
  categoryId: string
  isRecurring: boolean
  recurringInterval: string | null
  status: string
  allowMultiple: boolean
  dailyLimit: number | null
  scheduleDays: string | null
  scheduleTime: string | null
}

type Reward = {
  id: string
  title: string
  emoji: string
  description: string
  pointCost: number
  isActive: boolean
}

type Category = { id: string; name: string; emoji: string }

type ManageClientProps = {
  tasks: Task[]
  categories: Category[]
  rewards: Reward[]
  initialTab: string
}

export function ManageClient({ tasks, categories, rewards, initialTab }: ManageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? initialTab
  const [editingId, setEditingId] = useState<string | null>(null)

  function setTab(newTab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', newTab)
    router.push(`/manage?${params.toString()}`)
    setEditingId(null)
  }

  const statusOrder = ['active', 'pending_approval', 'rejected', 'archived']
  const sortedTasks = [...tasks].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  )

  const sortedRewards = [...rewards].sort(
    (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1)
  )

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Verwalten</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('tasks')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'tasks' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Aufgaben
        </button>
        <button
          type="button"
          onClick={() => setTab('rewards')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'rewards' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Belohnungen
        </button>
      </div>

      {tab === 'tasks' ? (
        <div className="space-y-2">
          {sortedTasks.length === 0 && (
            <p className="text-center py-8 text-slate-400 text-sm">Keine Aufgaben vorhanden.</p>
          )}
          {sortedTasks.map((task) => (
            <TaskRow
              key={`${task.id}-${task.title}-${task.status}`}
              task={task}
              categories={categories}
              isEditing={editingId === task.id}
              onStartEdit={() => setEditingId(task.id)}
              onCancelEdit={() => setEditingId(null)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRewards.length === 0 && (
            <p className="text-center py-8 text-slate-400 text-sm">Keine Belohnungen vorhanden.</p>
          )}
          {sortedRewards.map((reward) => (
            <RewardRow
              key={`${reward.id}-${reward.title}-${reward.isActive}`}
              reward={reward}
              isEditing={editingId === reward.id}
              onStartEdit={() => setEditingId(reward.id)}
              onCancelEdit={() => setEditingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
