'use client'
import { useRouter } from 'next/navigation'
import { TaskCategoryGroup } from '@/components/tasks/task-category-group'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }

export function TasksClient({ grouped, categories }: { grouped: Category[]; categories: Category[] }) {
  const router = useRouter()

  async function handleComplete(_taskId: string) {
    router.refresh()
  }

  const total = grouped.reduce((s, c) => s + c.tasks.length, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Aufgaben</h1>
        <CreateTaskDialog categories={categories} />
      </div>
      <p className="text-sm text-slate-500 mb-6">{total} offene Aufgaben</p>
      {total === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-slate-700">Alles erledigt!</p>
          <p className="text-sm text-slate-400 mt-1">Zeit für eine Pause — oder leg gleich neue Aufgaben an.</p>
        </div>
      )}
      {grouped.map((cat) => (
        <TaskCategoryGroup key={cat.id} category={cat} onComplete={handleComplete} />
      ))}
    </div>
  )
}
