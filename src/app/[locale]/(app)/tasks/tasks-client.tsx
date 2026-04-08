'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { TaskCategoryGroup } from '@/components/tasks/task-category-group'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import { CalendarView } from '@/components/tasks/calendar-view'
import { Calendar, List } from 'lucide-react'
import type { CalendarDay } from '@/lib/calendar'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
  nextDueAt?: string | null; decayHours?: number | null
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
  decayHoursByInterval?: Record<string, number>
  vacationStart?: string | null
  vacationEnd?: string | null
}

export function TasksClient({ grouped, categories, users, userRole, partnerId, partnerName, view, calendarDays, calYear, calMonth, today, availableTasks, decayHoursByInterval, vacationStart, vacationEnd }: TasksClientProps) {
  const router = useRouter()
  const t = useTranslations('tasks')

  async function handleComplete(_taskId: string) {
    router.refresh()
  }

  const total = grouped.reduce((s, c) => s + c.tasks.length, 0)
  const isCalendar = view === 'calendar'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[1.75rem] font-light uppercase tracking-wide leading-tight">{t('heading')}</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => router.push('/tasks?view=list')}
              className={`p-1.5 rounded-md transition-colors ${!isCalendar ? 'bg-card shadow-sm text-accent' : 'text-muted-foreground hover:text-muted-foreground'}`}
              title={t('listView')}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => router.push(`/tasks?view=calendar&year=${calYear}&month=${calMonth}`)}
              className={`p-1.5 rounded-md transition-colors ${isCalendar ? 'bg-card shadow-sm text-accent' : 'text-muted-foreground hover:text-muted-foreground'}`}
              title={t('calendarView')}
            >
              <Calendar size={16} />
            </button>
          </div>
          {!isCalendar && <CreateTaskDialog categories={categories} users={users} userRole={userRole} />}
        </div>
      </div>

      {isCalendar ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{t('monthOverview')}</p>
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
          <p className="text-sm text-muted-foreground mb-6">{t('openTasks', { total })}</p>
          {total === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-lg font-semibold text-foreground">{t('allDone')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('allDoneSubtitle')}</p>
            </div>
          )}
          {grouped.map((cat) => (
            <TaskCategoryGroup key={cat.id} category={cat} onComplete={handleComplete} partnerId={partnerId} partnerName={partnerName} decayHoursByInterval={decayHoursByInterval} vacationStart={vacationStart} vacationEnd={vacationEnd} />
          ))}
          <div className="flex justify-end mt-4">
            <Link href="/manage?tab=tasks" className="text-xs text-accent hover:text-accent-hover transition-colors">
              {t('manage')}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
