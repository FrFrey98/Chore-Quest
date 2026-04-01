'use client'

type TaskOption = { id: string; title: string; emoji: string }

type TaskFilterProps = {
  tasks: TaskOption[]
  value: string | null
  onChange: (taskId: string | null) => void
}

export function TaskFilter({ tasks, value, onChange }: TaskFilterProps) {
  return (
    <select
      className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">Alle Aufgaben</option>
      {tasks.map((t) => (
        <option key={t.id} value={t.id}>
          {t.emoji} {t.title}
        </option>
      ))}
    </select>
  )
}
