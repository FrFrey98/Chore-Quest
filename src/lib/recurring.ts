const INTERVAL_DAYS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
}

export function getNextDueAt(interval: string, from: Date): Date {
  const days = INTERVAL_DAYS[interval] ?? 7
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
