export type FeedEntry = {
  id: string
  type: 'completion' | 'redemption'
  user: { id: string; name: string }
  task?: { title: string; emoji: string }
  item?: { title: string; emoji: string }
  points: number
  at: string
  withUser?: { id: string; name: string } | null
}

export type FeedGroup = {
  label: string
  entries: FeedEntry[]
  totalTasks: number
  totalPoints: number
}

/**
 * Returns the Monday 00:00 UTC and Sunday 23:59:59.999 UTC bounding the given date.
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getUTCDay() // 0=Sun, 1=Mon, ...
  const diffToMonday = day === 0 ? 6 : day - 1
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diffToMonday))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * Groups feed entries into "Heute", "Gestern", "Diese Woche", "Letzte Woche".
 * Empty groups are omitted.
 */
export function groupFeedByDay(entries: FeedEntry[], now: Date = new Date()): FeedGroup[] {
  const todayKey = now.toISOString().slice(0, 10)
  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  const { start: weekStart } = getWeekBounds(now)
  const lastWeekEnd = new Date(weekStart)
  lastWeekEnd.setUTCMilliseconds(-1)
  const { start: lastWeekStart } = getWeekBounds(lastWeekEnd)

  const buckets: { label: string; entries: FeedEntry[] }[] = [
    { label: 'feed.today', entries: [] },
    { label: 'feed.yesterday', entries: [] },
    { label: 'feed.thisWeek', entries: [] },
    { label: 'feed.lastWeek', entries: [] },
  ]

  for (const entry of entries) {
    const dateKey = entry.at.slice(0, 10)
    const entryDate = new Date(entry.at)
    if (dateKey === todayKey) {
      buckets[0].entries.push(entry)
    } else if (dateKey === yesterdayKey) {
      buckets[1].entries.push(entry)
    } else if (entryDate >= weekStart) {
      buckets[2].entries.push(entry)
    } else if (entryDate >= lastWeekStart) {
      buckets[3].entries.push(entry)
    }
  }

  return buckets
    .filter((b) => b.entries.length > 0)
    .map((b) => ({
      ...b,
      totalTasks: b.entries.filter((e) => e.type === 'completion').length,
      totalPoints: b.entries.filter((e) => e.type === 'completion').reduce((s, e) => s + e.points, 0),
    }))
}
