'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TaskCategoryGroup } from '@/components/tasks/task-category-group'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import { CalendarView } from '@/components/tasks/calendar-view'
import { Calendar, List } from 'lucide-react'
import type { CalendarDay } from '@/lib/calendar'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }
type SimpleCategory = { id: string; name: string; emoji: string }

type UserItem = { id: string; name: string }

type TasksClientProps = {
  grouped: Category[]
  categories: SimpleCategory[]
  users?: UserItem[]
  userRole?: string
  partnerId?: string
  partnerName?: string
  view: string
  calendarDays: CalendarDay[] | null
  calYear: number
  calMonth: number
  today: string
  availableTasks: { id: string; emoji: string; title: string }[]
}

export function TasksClient({ grouped, categories, users, userRole, partnerId, partnerName, view, calendarDays, calYear, calMonth, today, availableTasks }: TasksClientProps) {
  const router = useRouter()

  async function handleComplete(_taskId: string) {
    router.refresh()
  }

  const total = grouped.reduce((s, c) => s + c.tasks.length, 0)
  const isCalendar = view === 'calendar'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Aufgaben</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => router.push('/tasks?view=list')}
              className={`p-1.5 rounded-md transition-colors ${!isCalendar ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Listenansicht"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => router.push(`/tasks?view=calendar&year=${calYear}&month=${calMonth}`)}
              className={`p-1.5 rounded-md transition-colors ${isCalendar ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Kalenderansicht"
            >
              <Calendar size={16} />
            </button>
          </div>
          {!isCalendar && <CreateTaskDialog categories={categories} users={users} userRole={userRole} />}
        </div>
      </div>

      {isCalendar ? (
        <>
          <p className="text-sm text-slate-500 mb-4">Monatsübersicht</p>
          {calendarDays && (
            <CalendarView
              year={calYear}
              month={calMonth}
              days={calendarDays}
              today={today}
              availableTasks={availableTasks}
              partnerId={partnerId}
              partnerName={partnerName}
            />
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-6">{total} offene Aufgaben</p>
          {total === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-lg font-semibold text-slate-700">Alles erledigt!</p>
              <p className="text-sm text-slate-400 mt-1">Zeit für eine Pause — oder leg gleich neue Aufgaben an.</p>
            </div>
          )}
          {grouped.map((cat) => (
            <TaskCategoryGroup key={cat.id} category={cat} onComplete={handleComplete} partnerId={partnerId} partnerName={partnerName} />
          ))}
          <div className="flex justify-end mt-4">
            <Link href="/manage?tab=tasks" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              Verwalten →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
