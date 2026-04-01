type Completion = {
  completedAt: Date
  points: number
  userId: string
  taskId: string
  task?: { categoryId?: string; title?: string; emoji?: string }
}

type DayPoint = { date: string; count: number; points: number }
type WeekPoint = { week: string; count: number; points: number }
type CategoryPoint = { categoryId: string; name: string; emoji: string; count: number }
type TopTask = { taskId: string; title: string; emoji: string; count: number }
type ScoreboardEntry = { userId: string; name: string; taskCount: number; points: number }

function filterByUser<T extends { userId: string }>(items: T[], userId?: string): T[] {
  return userId ? items.filter((c) => c.userId === userId) : items
}

export function groupByDay(completions: Completion[], userId?: string): DayPoint[] {
  const filtered = filterByUser(completions, userId)
  const map = new Map<string, { count: number; points: number }>()

  for (const c of filtered) {
    const key = c.completedAt.toISOString().slice(0, 10)
    const entry = map.get(key) ?? { count: 0, points: 0 }
    entry.count++
    entry.points += c.points
    map.set(key, entry)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, ...val }))
}

function getISOWeek(date: Date): { week: number; isoYear: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const isoYear = d.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week, isoYear }
}

export function groupByWeek(completions: Completion[], userId?: string): WeekPoint[] {
  const filtered = filterByUser(completions, userId)
  const map = new Map<string, { week: string; count: number; points: number }>()

  for (const c of filtered) {
    const { week, isoYear } = getISOWeek(c.completedAt)
    const sortKey = `${isoYear}-${String(week).padStart(2, '0')}`
    const label = `KW ${week}`
    const entry = map.get(sortKey) ?? { week: label, count: 0, points: 0 }
    entry.count++
    entry.points += c.points
    map.set(sortKey, entry)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, val]) => ({ week: val.week, count: val.count, points: val.points }))
}

export function groupByCategory(
  completions: Completion[],
  categories: { id: string; name: string; emoji: string }[],
  userId?: string
): CategoryPoint[] {
  const filtered = filterByUser(completions, userId)
  const map = new Map<string, number>()

  for (const c of filtered) {
    const catId = c.task?.categoryId ?? ''
    map.set(catId, (map.get(catId) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([catId, count]) => {
      const cat = categories.find((c) => c.id === catId)
      return { categoryId: catId, name: cat?.name ?? catId, emoji: cat?.emoji ?? '', count }
    })
    .sort((a, b) => b.count - a.count)
}

export function topTasks(
  completions: Pick<Completion, 'taskId' | 'task'>[],
  limit: number = 5
): TopTask[] {
  const map = new Map<string, { title: string; emoji: string; count: number }>()

  for (const c of completions) {
    const entry = map.get(c.taskId) ?? { title: c.task?.title ?? '', emoji: c.task?.emoji ?? '', count: 0 }
    entry.count++
    map.set(c.taskId, entry)
  }

  return Array.from(map.entries())
    .map(([taskId, val]) => ({ taskId, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function buildHeatmap(completions: Pick<Completion, 'completedAt' | 'points'>[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const c of completions) {
    const key = c.completedAt.toISOString().slice(0, 10)
    map[key] = (map[key] ?? 0) + c.points
  }
  return map
}

export function buildScoreboard(
  completions: Pick<Completion, 'userId' | 'points'>[],
  users: { id: string; name: string }[]
): ScoreboardEntry[] {
  const map = new Map<string, { taskCount: number; points: number }>()

  for (const c of completions) {
    const entry = map.get(c.userId) ?? { taskCount: 0, points: 0 }
    entry.taskCount++
    entry.points += c.points
    map.set(c.userId, entry)
  }

  return users.map((u) => {
    const entry = map.get(u.id) ?? { taskCount: 0, points: 0 }
    return { userId: u.id, name: u.name, ...entry }
  })
}
