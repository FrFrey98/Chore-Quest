import { DEFAULT_RECURRING_INTERVALS } from '@/lib/config'

const DAY_MAP: Record<string, number> = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
}

export type ScheduleOverride = { date: string; type: 'add' | 'skip' }

export function getNextDueAtForDays(
  scheduleDays: string,
  from: Date,
  overrides: ScheduleOverride[] = []
): Date | null {
  const targetDays = scheduleDays
    .split(',')
    .map((d) => DAY_MAP[d.trim().toLowerCase()])
    .filter((d) => d !== undefined)

  const skipDates = new Set(
    overrides.filter((o) => o.type === 'skip').map((o) => o.date)
  )
  const addDates = overrides
    .filter((o) => o.type === 'add')
    .map((o) => o.date)
    .sort()

  const start = new Date(from)
  start.setUTCHours(0, 0, 0, 0)

  let patternResult: Date | null = null

  for (let offset = 1; offset <= 56; offset++) {
    const candidate = new Date(start)
    candidate.setUTCDate(start.getUTCDate() + offset)
    const dateStr = candidate.toISOString().slice(0, 10)

    if (targetDays.includes(candidate.getUTCDay()) && !skipDates.has(dateStr)) {
      patternResult = candidate
      break
    }
  }

  // Find the earliest add override that is after `from` and within the 56-day boundary
  const fromDateStr = start.toISOString().slice(0, 10)
  const maxDate = new Date(start)
  maxDate.setUTCDate(start.getUTCDate() + 56)
  const maxDateStr = maxDate.toISOString().slice(0, 10)
  const earliestAdd = addDates.find((d) => d > fromDateStr && d <= maxDateStr) ?? null

  if (earliestAdd && (!patternResult || earliestAdd < patternResult.toISOString().slice(0, 10))) {
    const addDate = new Date(`${earliestAdd}T00:00:00.000Z`)
    return addDate
  }

  return patternResult
}

type ScheduleOpts = {
  scheduleDays?: string | null
  overrides?: ScheduleOverride[]
}

export function getNextDueAt(
  interval: string,
  from: Date,
  intervals?: Record<string, number>,
  scheduleOpts?: ScheduleOpts
): Date | null {
  if (scheduleOpts?.scheduleDays) {
    return getNextDueAtForDays(scheduleOpts.scheduleDays, from, scheduleOpts.overrides ?? [])
  }
  const i = intervals ?? DEFAULT_RECURRING_INTERVALS
  const days = i[interval] ?? 7
  const next = new Date(from)
  next.setUTCHours(0, 0, 0, 0)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function isTaskVisible(
  task: { isRecurring: boolean; nextDueAt: Date | null },
  now: Date = new Date()
): boolean {
  if (!task.isRecurring) return true
  if (!task.nextDueAt) return true
  return task.nextDueAt <= now
}
