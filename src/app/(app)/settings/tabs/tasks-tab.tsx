'use client'
type Category = { id: string; name: string; emoji: string; taskCount: number }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: { id: string; name: string; emoji: string } }
export function TasksTab({ tasks, categories, userId }: { tasks: Task[]; categories: Category[]; userId: string }) {
  return <div className="text-slate-400 text-sm">Tasks-Tab ({tasks.length} Tasks)</div>
}
