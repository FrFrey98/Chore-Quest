'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import type { CalendarDay, DayTask } from '@/lib/calendar'

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const

const WEEKDAY_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'] as const

type CalendarViewProps = {
  year: number
  month: number
  days: CalendarDay[]
  today: string // YYYY-MM-DD
  availableTasks: { id: string; emoji: string; title: string }[]
  partnerId?: string
  partnerName?: string
}

function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun, 1=Mon, ...
  // Convert to Monday-based offset: Mon=0, Tue=1, ..., Sun=6
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysCount = new Date(year, month, 0).getDate()

  const grid: (string | null)[] = []
  for (let i = 0; i < offset; i++) grid.push(null)
  for (let d = 1; d <= daysCount; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    grid.push(`${year}-${mm}-${dd}`)
  }
  return grid
}

function getYesterday(today: string): string {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function CalendarView({
  year,
  month,
  days,
  today,
  availableTasks,
  partnerId,
  partnerName: _partnerName,
}: CalendarViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('tasks.calendar')
  const tt = useTranslations('tasks')
  const tMonths = useTranslations('months')
  const tWeekdays = useTranslations('weekdays')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const grid = getMonthGrid(year, month)
  const dayMap = new Map<string, CalendarDay>(days.map((d) => [d.date, d]))
  const yesterday = getYesterday(today)

  function navigateMonth(dir: -1 | 1) {
    let y = year
    let m = month + dir
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    router.push(`/tasks?view=calendar&year=${y}&month=${m}`)
  }

  function toggleDay(date: string) {
    if (selectedDate === date) {
      setSelectedDate(null)
      setShowAddTask(false)
    } else {
      setSelectedDate(date)
      setShowAddTask(false)
    }
  }

  async function handleComplete(taskId: string) {
    setLoadingId(taskId)
    try {
      const isYesterday = selectedDate === yesterday
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isYesterday ? JSON.stringify({ date: 'yesterday' }) : undefined,
      })
      const data = await res.json()

      // Handle offline queued completion
      if (data.queued) {
        const taskTitle = selectedDay?.tasks.find((tk) => tk.taskId === taskId)?.title ?? ''
        toast(t('syncing', { title: taskTitle }), 'info')
        return
      }

      if (!res.ok) {
        throw new Error(data.error ?? tc('error'))
      }
      toast(t('taskChecked'), 'success')
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleAddOverride(taskId: string) {
    if (!selectedDate) return
    setLoadingId(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/schedule-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, type: 'add' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      toast(t('taskAdded'), 'success')
      setShowAddTask(false)
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleToggleSkip(taskId: string, isCurrentlySkipped: boolean) {
    if (!selectedDate) return
    setLoadingId(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/schedule-override`, {
        method: isCurrentlySkipped ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isCurrentlySkipped
          ? JSON.stringify({ date: selectedDate })
          : JSON.stringify({ date: selectedDate, type: 'skip' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? tc('error'))
      }
      toast(isCurrentlySkipped ? t('skipRemoved') : t('taskSkipped'), 'success')
      router.refresh()
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : tc('error'), 'error')
    } finally {
      setLoadingId(null)
    }
  }

  const selectedDay = selectedDate ? dayMap.get(selectedDate) : undefined

  const isTodayOrYesterday = (date: string) => date === today || date === yesterday
  const isFuture = (date: string) => date > today

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label={t('prevMonth')}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-slate-800">
          {tMonths(MONTH_KEYS[month - 1])} {year}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label={t('nextMonth')}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {WEEKDAY_KEYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {tWeekdays(d)}
          </div>
        ))}

        {/* Day cells */}
        {grid.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} />
          }
          const calDay = dayMap.get(date)
          const tasks = calDay?.tasks ?? []
          const dayNum = parseInt(date.slice(8), 10)
          const isToday = date === today
          const isSelected = date === selectedDate

          const completedTasks = tasks.filter((tk) => tk.status === 'completed')
          const missedTasks = tasks.filter((tk) => tk.status === 'missed')
          const pendingTasks = tasks.filter((tk) => tk.status === 'pending')

          const visibleEmojis = tasks.slice(0, 4)
          const overflow = tasks.length - 4

          return (
            <button
              key={date}
              onClick={() => toggleDay(date)}
              className={`min-h-[52px] rounded-lg bg-white p-1 flex flex-col items-center gap-0.5 transition-all
                ${isToday ? 'ring-2 ring-indigo-400' : ''}
                ${isSelected ? 'ring-2 ring-indigo-500' : ''}
                ${!isToday && !isSelected ? 'hover:bg-slate-50' : ''}
              `}
            >
              <span className={`text-xs font-medium leading-none ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                {dayNum}
              </span>
              {/* Emoji badges */}
              {visibleEmojis.length > 0 && (
                <div className="flex flex-wrap justify-center gap-px">
                  {visibleEmojis.map((tk, i) => (
                    <span key={i} className="text-[10px] leading-none">{tk.emoji}</span>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[9px] text-slate-400 leading-none">+{overflow}</span>
                  )}
                </div>
              )}
              {/* Status dots */}
              {tasks.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {completedTasks.map((_, i) => (
                    <span key={`c-${i}`} className="w-[5px] h-[5px] rounded-full bg-green-500 inline-block" />
                  ))}
                  {missedTasks.map((_, i) => (
                    <span key={`m-${i}`} className="w-[5px] h-[5px] rounded-full bg-red-400 inline-block" />
                  ))}
                  {pendingTasks.map((_, i) => (
                    <span key={`p-${i}`} className="w-[5px] h-[5px] rounded-full bg-slate-300 inline-block" />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-[5px] h-[5px] rounded-full bg-green-500 inline-block" />
          {t('legend.completed')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-[5px] h-[5px] rounded-full bg-slate-300 inline-block" />
          {t('legend.open')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-[5px] h-[5px] rounded-full bg-red-400 inline-block" />
          {t('legend.missed')}
        </span>
      </div>

      {/* Day detail */}
      {selectedDate && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <button
              onClick={() => { setSelectedDate(null); setShowAddTask(false) }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Task list */}
          {selectedDay && selectedDay.tasks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedDay.tasks.map((task: DayTask) => (
                <div
                  key={task.taskId}
                  className={`flex items-center gap-3 p-2.5 rounded-lg ${
                    task.status === 'completed'
                      ? 'bg-green-50'
                      : task.status === 'missed'
                      ? 'bg-red-50'
                      : 'bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{task.emoji}</span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{task.title}</span>
                  {task.status === 'completed' && (
                    <span className="text-xs text-green-600 font-semibold">✓ +{task.points}</span>
                  )}
                  {task.status === 'missed' && (
                    <span className="text-xs text-red-400 font-medium">{t('missed')}</span>
                  )}
                  {/* Actions for today/yesterday */}
                  {isTodayOrYesterday(selectedDate) && task.status === 'pending' && (
                    <button
                      onClick={() => handleComplete(task.taskId)}
                      disabled={loadingId === task.taskId}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    >
                      {loadingId === task.taskId ? '…' : <><Check size={12} /> {tt('checkOff')}</>}
                    </button>
                  )}
                  {/* Actions for future days */}
                  {isFuture(selectedDate) && task.status === 'pending' && (
                    <button
                      onClick={() => handleToggleSkip(task.taskId, false)}
                      disabled={loadingId === task.taskId}
                      className="flex items-center gap-1 text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg px-2 py-1.5 transition-colors disabled:opacity-50"
                      title={t('taskSkipped')}
                    >
                      {loadingId === task.taskId ? '…' : <X size={14} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">{t('noTasks')}</p>
          )}

          {/* Add task button for future days */}
          {isFuture(selectedDate) && (
            <div>
              {!showAddTask ? (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-semibold"
                >
                  <Plus size={14} /> {t('addTask')}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{t('addTask')}</span>
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {availableTasks.map((tk) => (
                      <button
                        key={tk.id}
                        onClick={() => handleAddOverride(tk.id)}
                        disabled={loadingId === tk.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg text-sm text-left transition-colors disabled:opacity-50"
                      >
                        <span>{tk.emoji}</span>
                        <span className="flex-1 text-slate-700">{tk.title}</span>
                        {loadingId === tk.id && <span className="text-xs text-slate-400">…</span>}
                      </button>
                    ))}
                    {availableTasks.length === 0 && (
                      <p className="text-xs text-slate-400">{t('noTasksAvailable')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
