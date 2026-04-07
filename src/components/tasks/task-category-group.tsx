import { TaskCard } from './task-card'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }

export function TaskCategoryGroup({
  category,
  onComplete,
  partnerId,
  partnerName,
}: {
  category: Category
  onComplete: (id: string) => Promise<void>
  partnerId?: string
  partnerName?: string
}) {
  if (category.tasks.length === 0) return null
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {category.emoji} {category.name}
      </h2>
      <div className="space-y-2">
        {category.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onComplete} partnerId={partnerId} partnerName={partnerName} />
        ))}
      </div>
    </div>
  )
}
