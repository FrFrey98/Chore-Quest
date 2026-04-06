const DAY_MAP: Record<string, number> = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
}

export type CalendarTask = {
  id: string
  emoji: string
  title: string
  points: number
  isRecurring: boolean
  recurringInterval: string | null
  scheduleDays: string | null
  nextDueAt: Date | null
}

export type CalendarCompletion = {
  taskId: string
  date: string // YYYY-MM-DD
  points: number
}

export type CalendarOverride = {
  taskId: string
  date: string
  type: 'add' | 'skip'
}

export type DayTask = {
  taskId: string
  emoji: string
  title: string
  points: number | null // null if pending/missed
  status: 'completed' | 'pending' | 'missed'
}

export type CalendarDay = {
  date: string // YYYY-MM-DD
  tasks: DayTask[]
}

function formatDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function getTasksForMonth(
  year: number,
  month: number, // 1-12
  tasks: CalendarTask[],
  completions: CalendarCompletion[],
  overrides: CalendarOverride[]
): CalendarDay[] {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Index completions by "date:taskId" for O(1) lookup
  const completionMap = new Map<string, CalendarCompletion>()
  for (const c of completions) {
    completionMap.set(`${c.date}:${c.taskId}`, c)
  }

  // Index overrides by "date:taskId" for O(1) lookup
  const overrideMap = new Map<string, CalendarOverride>()
  for (const o of overrides) {
    overrideMap.set(`${o.date}:${o.taskId}`, o)
  }

  const totalDays = daysInMonth(year, month)
  const result: CalendarDay[] = []

  for (let day = 1; day <= totalDays; day++) {
    const date = formatDate(year, month, day)
    const dayOfWeek = new Date(year, month - 1, day).getDay() // 0=Sun, 1=Mon, ...

    const dayTasks: DayTask[] = []

    for (const task of tasks) {
      const overrideKey = `${date}:${task.id}`
      const override = overrideMap.get(overrideKey)

      // Determine if task is naturally due on this day
      let isDue = false

      if (task.scheduleDays) {
        // Check if day-of-week matches one of the comma-separated weekday codes
        const codes = task.scheduleDays.split(',').map((s) => s.trim())
        isDue = codes.some((code) => DAY_MAP[code] === dayOfWeek)
      } else if (task.recurringInterval === 'daily') {
        isDue = true
      } else if (task.recurringInterval === 'weekly') {
        // Weekly without specific days: don't show in calendar
        // Users should set scheduleDays for calendar visibility
        isDue = false
      } else if (task.recurringInterval === 'monthly') {
        isDue = false
      }

      // Apply overrides
      if (override?.type === 'skip') {
        isDue = false
      } else if (override?.type === 'add') {
        isDue = true
      }

      if (!isDue) continue

      // Determine status
      const completionKey = `${date}:${task.id}`
      const completion = completionMap.get(completionKey)

      let status: DayTask['status']
      let points: number | null = null

      if (completion) {
        status = 'completed'
        points = completion.points
      } else {
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1 // 1-12
        // A day is missed only if its month is fully in the past
        const monthIsPast =
          year < currentYear || (year === currentYear && month < currentMonth)
        if (monthIsPast) {
          status = 'missed'
        } else {
          status = 'pending'
        }
      }

      dayTasks.push({
        taskId: task.id,
        emoji: task.emoji,
        title: task.title,
        points,
        status,
      })
    }

    result.push({ date, tasks: dayTasks })
  }

  return result
}
