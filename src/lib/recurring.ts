import { DEFAULT_RECURRING_INTERVALS } from '@/lib/config'

export function getNextDueAt(interval: string, from: Date, intervals?: Record<string, number>): Date {
  const i = intervals ?? DEFAULT_RECURRING_INTERVALS
  const days = i[interval] ?? 7
  const next = new Date(from)
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
