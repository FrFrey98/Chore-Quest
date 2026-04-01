'use client'
import { useRouter } from 'next/navigation'
import { TaskCategoryGroup } from '@/components/tasks/task-category-group'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }

export function TasksClient({ grouped }: { grouped: Category[] }) {
  const router = useRouter()

  async function handleComplete(_taskId: string) {
    router.refresh()
  }

  const total = grouped.reduce((s, c) => s + c.tasks.length, 0)

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Aufgaben</h1>
      <p className="text-sm text-slate-500 mb-6">{total} offene Aufgaben</p>
      {total === 0 && (
        <p className="text-center text-slate-400 py-12">
          🎉 Alle Aufgaben erledigt!
        </p>
      )}
      {grouped.map((cat) => (
        <TaskCategoryGroup key={cat.id} category={cat} onComplete={handleComplete} />
      ))}
    </div>
  )
}
