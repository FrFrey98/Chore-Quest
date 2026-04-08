type TopTasksProps = {
  tasks: { taskId: string; title: string; emoji: string; count: number }[]
  barColor?: string
  label?: string
  emptyLabel?: string
}

export function TopTasks({ tasks, barColor = 'bg-accent', label, emptyLabel = 'No tasks in period' }: TopTasksProps) {
  const max = Math.max(1, ...tasks.map((t) => t.count))

  return (
    <div>
      {label && <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.taskId} className="flex items-center gap-2">
            <span className="text-sm">{task.emoji}</span>
            <span className="text-xs text-foreground truncate flex-1 min-w-0">{task.title}</span>
            <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`${barColor} h-full rounded-full`}
                style={{ width: `${(task.count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-6 text-right">{task.count}</span>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  )
}
