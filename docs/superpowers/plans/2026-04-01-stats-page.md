# Stats Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/stats` page with Personal and Comparison tabs, flexible date range, activity charts, category distribution, heatmaps, top tasks, scoreboard, and task-level filtering.

**Architecture:** Server Component (`page.tsx`) loads all completions in the date range via Prisma and passes them to a Client Component (`stats-client.tsx`) that handles tab switching, date picker, task filter, and Y-axis toggle. Pure helper functions in `src/lib/stats.ts` transform raw completions into chart-ready data. Recharts is used for LineChart and BarChart; the existing Heatmap component is extended for dynamic date ranges.

**Tech Stack:** Next.js 14 (App Router), Prisma/SQLite, Recharts, Tailwind CSS, Vitest

---

## File Structure

| File | Type | Responsibility |
|------|------|----------------|
| `src/lib/stats.ts` | Shared | Pure helper functions: groupByDay, groupByWeek, groupByCategory, topTasks, buildHeatmap, buildScoreboard |
| `src/tests/lib/stats.test.ts` | Test | Unit tests for all stats helpers |
| `src/app/(app)/stats/page.tsx` | Server | Prisma queries, date range parsing, data preparation |
| `src/app/(app)/stats/stats-client.tsx` | Client | Tabs, date picker, task filter, Y-toggle, grid layout |
| `src/components/stats/summary-cards.tsx` | Server | Three stat cards (tasks, points, avg/day) |
| `src/components/stats/activity-chart.tsx` | Client | Recharts LineChart (personal) and StackedBarChart (comparison) |
| `src/components/stats/scoreboard.tsx` | Server | User vs. Partner comparison card |
| `src/components/stats/task-filter.tsx` | Client | Dropdown to filter by specific task |
| `src/components/stats/top-tasks.tsx` | Server | Top-5 ranked task list with bars |
| `src/components/stats/heatmap.tsx` | Client | Modified: accept optional `from`/`to` props for dynamic range |
| `src/app/(app)/page.tsx` | Server | Modified: add "Alle Statistiken →" link below WeekChart |

---

### Task 1: Stats Helper Functions + Tests

**Files:**
- Create: `src/lib/stats.ts`
- Create: `src/tests/lib/stats.test.ts`

- [ ] **Step 1: Write failing tests for groupByDay**

```typescript
// src/tests/lib/stats.test.ts
import { describe, it, expect } from 'vitest'
import { groupByDay } from '@/lib/stats'

describe('groupByDay', () => {
  it('groups completions by date and sums counts and points', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u1', taskId: 't2' },
      { completedAt: new Date('2026-03-16T09:00:00Z'), points: 40, userId: 'u1', taskId: 't1' },
    ]
    const result = groupByDay(completions)
    expect(result).toEqual([
      { date: '2026-03-15', count: 2, points: 50 },
      { date: '2026-03-16', count: 1, points: 40 },
    ])
  })

  it('filters by userId when provided', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u2', taskId: 't2' },
    ]
    const result = groupByDay(completions, 'u1')
    expect(result).toEqual([{ date: '2026-03-15', count: 1, points: 30 }])
  })

  it('returns empty array for no completions', () => {
    expect(groupByDay([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/lib/stats.test.ts`
Expected: FAIL — `groupByDay` not found

- [ ] **Step 3: Write failing tests for groupByWeek**

Add to `src/tests/lib/stats.test.ts`:

```typescript
import { groupByWeek } from '@/lib/stats'

describe('groupByWeek', () => {
  it('groups completions by ISO week', () => {
    const completions = [
      { completedAt: new Date('2026-03-30T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' }, // KW 14
      { completedAt: new Date('2026-03-31T10:00:00Z'), points: 20, userId: 'u1', taskId: 't2' }, // KW 14
      { completedAt: new Date('2026-04-06T10:00:00Z'), points: 40, userId: 'u1', taskId: 't1' }, // KW 15
    ]
    const result = groupByWeek(completions)
    expect(result).toHaveLength(2)
    expect(result[0].week).toBe('KW 14')
    expect(result[0].count).toBe(2)
    expect(result[0].points).toBe(50)
    expect(result[1].week).toBe('KW 15')
    expect(result[1].count).toBe(1)
  })

  it('filters by userId when provided', () => {
    const completions = [
      { completedAt: new Date('2026-03-30T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-30T14:00:00Z'), points: 20, userId: 'u2', taskId: 't2' },
    ]
    const result = groupByWeek(completions, 'u1')
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(1)
    expect(result[0].points).toBe(30)
  })
})
```

- [ ] **Step 4: Write failing tests for groupByCategory, topTasks, buildHeatmap, buildScoreboard**

Add to `src/tests/lib/stats.test.ts`:

```typescript
import { groupByCategory, topTasks, buildHeatmap, buildScoreboard } from '@/lib/stats'

describe('groupByCategory', () => {
  it('groups completions by category with name and emoji', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1', task: { categoryId: 'c1' } },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u1', taskId: 't2', task: { categoryId: 'c1' } },
      { completedAt: new Date('2026-03-16T09:00:00Z'), points: 40, userId: 'u1', taskId: 't3', task: { categoryId: 'c2' } },
    ]
    const categories = [
      { id: 'c1', name: 'Küche', emoji: '🍳' },
      { id: 'c2', name: 'Bad', emoji: '🚿' },
    ]
    const result = groupByCategory(completions, categories)
    expect(result).toEqual([
      { categoryId: 'c1', name: 'Küche', emoji: '🍳', count: 2 },
      { categoryId: 'c2', name: 'Bad', emoji: '🚿', count: 1 },
    ])
  })

  it('filters by userId when provided', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1', task: { categoryId: 'c1' } },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u2', taskId: 't2', task: { categoryId: 'c1' } },
    ]
    const categories = [{ id: 'c1', name: 'Küche', emoji: '🍳' }]
    const result = groupByCategory(completions, categories, 'u1')
    expect(result).toEqual([{ categoryId: 'c1', name: 'Küche', emoji: '🍳', count: 1 }])
  })
})

describe('topTasks', () => {
  it('returns top tasks sorted by count descending', () => {
    const completions = [
      { taskId: 't1', task: { title: 'Staubsaugen', emoji: '🧹' } },
      { taskId: 't1', task: { title: 'Staubsaugen', emoji: '🧹' } },
      { taskId: 't1', task: { title: 'Staubsaugen', emoji: '🧹' } },
      { taskId: 't2', task: { title: 'Abspülen', emoji: '🍽️' } },
      { taskId: 't2', task: { title: 'Abspülen', emoji: '🍽️' } },
    ] as any[]
    const result = topTasks(completions, 5)
    expect(result).toEqual([
      { taskId: 't1', title: 'Staubsaugen', emoji: '🧹', count: 3 },
      { taskId: 't2', title: 'Abspülen', emoji: '🍽️', count: 2 },
    ])
  })

  it('limits results to specified count', () => {
    const completions = [
      { taskId: 't1', task: { title: 'A', emoji: '1' } },
      { taskId: 't2', task: { title: 'B', emoji: '2' } },
      { taskId: 't3', task: { title: 'C', emoji: '3' } },
    ] as any[]
    const result = topTasks(completions, 2)
    expect(result).toHaveLength(2)
  })
})

describe('buildHeatmap', () => {
  it('sums points per day as YYYY-MM-DD keys', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30 },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20 },
      { completedAt: new Date('2026-03-16T09:00:00Z'), points: 40 },
    ] as any[]
    const result = buildHeatmap(completions)
    expect(result).toEqual({ '2026-03-15': 50, '2026-03-16': 40 })
  })

  it('returns empty object for no completions', () => {
    expect(buildHeatmap([])).toEqual({})
  })
})

describe('buildScoreboard', () => {
  it('sums task count and points per user', () => {
    const completions = [
      { userId: 'u1', points: 30 },
      { userId: 'u1', points: 20 },
      { userId: 'u2', points: 40 },
    ] as any[]
    const users = [
      { id: 'u1', name: 'Franz' },
      { id: 'u2', name: 'Michelle' },
    ]
    const result = buildScoreboard(completions, users)
    expect(result).toEqual([
      { userId: 'u1', name: 'Franz', taskCount: 2, points: 50 },
      { userId: 'u2', name: 'Michelle', taskCount: 1, points: 40 },
    ])
  })
})
```

- [ ] **Step 5: Implement all helper functions**

```typescript
// src/lib/stats.ts

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

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function groupByWeek(completions: Completion[], userId?: string): WeekPoint[] {
  const filtered = filterByUser(completions, userId)
  const map = new Map<string, { count: number; points: number }>()

  for (const c of filtered) {
    const week = `KW ${getISOWeek(c.completedAt)}`
    const entry = map.get(week) ?? { count: 0, points: 0 }
    entry.count++
    entry.points += c.points
    map.set(week, entry)
  }

  return Array.from(map.entries())
    .map(([week, val]) => ({ week, ...val }))
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/tests/lib/stats.test.ts`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/stats.ts src/tests/lib/stats.test.ts
git commit -m "feat(stats): add pure helper functions for stats page data processing"
```

---

### Task 2: Extend Heatmap for Dynamic Date Range

**Files:**
- Modify: `src/components/stats/heatmap.tsx`

- [ ] **Step 1: Update Heatmap to accept optional from/to props**

The current Heatmap always shows 26 weeks from today. Add optional `from` and `to` props. When provided, compute the number of weeks from the date range. When omitted, keep the existing 26-week behavior.

```typescript
// src/components/stats/heatmap.tsx
'use client'

type HeatmapProps = {
  data: Record<string, number>
  from?: string // 'YYYY-MM-DD'
  to?: string   // 'YYYY-MM-DD'
}

const DEFAULT_WEEKS = 26

function getColor(points: number): string {
  if (points === 0) return '#e2e8f0'
  if (points < 50) return '#c7d2fe'
  if (points < 150) return '#818cf8'
  if (points < 300) return '#6366f1'
  return '#4338ca'
}

export function Heatmap({ data, from, to }: HeatmapProps) {
  let startDate: Date
  let totalDays: number

  if (from && to) {
    startDate = new Date(from + 'T00:00:00Z')
    const endDate = new Date(to + 'T00:00:00Z')
    totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
  } else {
    const today = new Date()
    totalDays = DEFAULT_WEEKS * 7
    startDate = new Date(today)
    startDate.setUTCDate(startDate.getUTCDate() - totalDays + 1)
  }

  const weeks = Math.ceil(totalDays / 7)
  const days: { date: string; points: number }[] = []

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate)
    d.setUTCDate(d.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, points: data[key] ?? 0 })
  }

  return (
    <div
      className="grid gap-1 overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${weeks}, 12px)`, gridTemplateRows: 'repeat(7, 12px)' }}
    >
      {days.map(({ date, points }) => (
        <div
          key={date}
          title={`${date}: ${points} Pkt`}
          className="rounded-sm"
          style={{ width: 12, height: 12, background: getColor(points) }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify existing Heatmap usage still works**

Run: `npx next build`
Expected: Build passes (no type errors). The profile page uses `<Heatmap data={...} />` without from/to, which still works.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/heatmap.tsx
git commit -m "feat(stats): extend heatmap to support dynamic date ranges"
```

---

### Task 3: Summary Cards, Scoreboard, Top Tasks, Task Filter Components

**Files:**
- Create: `src/components/stats/summary-cards.tsx`
- Create: `src/components/stats/scoreboard.tsx`
- Create: `src/components/stats/top-tasks.tsx`
- Create: `src/components/stats/task-filter.tsx`

- [ ] **Step 1: Create SummaryCards component**

```typescript
// src/components/stats/summary-cards.tsx

type SummaryCardsProps = {
  taskCount: number
  totalPoints: number
  avgPerDay: number
}

export function SummaryCards({ taskCount, totalPoints, avgPerDay }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-slate-800">{taskCount}</p>
        <p className="text-xs text-slate-500 mt-1">Erledigte Aufgaben</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-slate-800">{totalPoints.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">Verdiente Punkte</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-slate-800">{avgPerDay.toFixed(1)}</p>
        <p className="text-xs text-slate-500 mt-1">Aufgaben / Tag</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Scoreboard component**

```typescript
// src/components/stats/scoreboard.tsx

type ScoreboardProps = {
  entries: { userId: string; name: string; taskCount: number; points: number }[]
}

export function Scoreboard({ entries }: ScoreboardProps) {
  const [left, right] = entries.length >= 2
    ? [entries[0], entries[1]]
    : [entries[0] ?? { name: '–', taskCount: 0, points: 0 }, { name: '–', taskCount: 0, points: 0 }]

  const leftWins = left.taskCount > right.taskCount
  const rightWins = right.taskCount > left.taskCount

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left user */}
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-600">
            {leftWins && '👑 '}{left.name}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{left.taskCount}</p>
          <p className="text-xs text-slate-500">Aufgaben</p>
          <p className="text-lg font-bold text-slate-700 mt-2">{left.points.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Punkte</p>
        </div>

        {/* Divider */}
        <div className="text-slate-300 text-lg font-bold">vs.</div>

        {/* Right user */}
        <div className="text-center">
          <p className="text-sm font-semibold text-pink-600">
            {rightWins && '👑 '}{right.name}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{right.taskCount}</p>
          <p className="text-xs text-slate-500">Aufgaben</p>
          <p className="text-lg font-bold text-slate-700 mt-2">{right.points.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Punkte</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create TopTasks component**

```typescript
// src/components/stats/top-tasks.tsx

type TopTasksProps = {
  tasks: { taskId: string; title: string; emoji: string; count: number }[]
  barColor?: string
  label?: string
}

export function TopTasks({ tasks, barColor = 'bg-indigo-400', label }: TopTasksProps) {
  const max = Math.max(1, ...tasks.map((t) => t.count))

  return (
    <div>
      {label && <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.taskId} className="flex items-center gap-2">
            <span className="text-sm">{task.emoji}</span>
            <span className="text-xs text-slate-700 truncate flex-1 min-w-0">{task.title}</span>
            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`${barColor} h-full rounded-full`}
                style={{ width: `${(task.count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-6 text-right">{task.count}</span>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400">Keine Aufgaben im Zeitraum</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create TaskFilter component**

```typescript
// src/components/stats/task-filter.tsx
'use client'

type TaskOption = { id: string; title: string; emoji: string }

type TaskFilterProps = {
  tasks: TaskOption[]
  value: string | null
  onChange: (taskId: string | null) => void
}

export function TaskFilter({ tasks, value, onChange }: TaskFilterProps) {
  return (
    <select
      className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">Alle Aufgaben</option>
      {tasks.map((t) => (
        <option key={t.id} value={t.id}>
          {t.emoji} {t.title}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npx next build`
Expected: Build passes

- [ ] **Step 6: Commit**

```bash
git add src/components/stats/summary-cards.tsx src/components/stats/scoreboard.tsx src/components/stats/top-tasks.tsx src/components/stats/task-filter.tsx
git commit -m "feat(stats): add summary cards, scoreboard, top tasks, and task filter components"
```

---

### Task 4: Activity Chart Component (Recharts)

**Files:**
- Create: `src/components/stats/activity-chart.tsx`

- [ ] **Step 1: Create ActivityChart component**

This component renders either a LineChart (personal tab) or a stacked BarChart (comparison tab). It receives pre-grouped data as props.

```typescript
// src/components/stats/activity-chart.tsx
'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

type PersonalDataPoint = { date: string; count: number; points: number }
type ComparisonDataPoint = { date: string; userCount: number; userPoints: number; partnerCount: number; partnerPoints: number }

type ActivityChartProps = {
  mode: 'personal' | 'comparison'
  metric: 'count' | 'points'
  personalData?: PersonalDataPoint[]
  comparisonData?: ComparisonDataPoint[]
  userName?: string
  partnerName?: string
}

export function ActivityChart({ mode, metric, personalData, comparisonData, userName, partnerName }: ActivityChartProps) {
  if (mode === 'personal' && personalData) {
    const dataKey = metric === 'count' ? 'count' : 'points'
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={personalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={(v: string) => v}
            formatter={(value: number) => [value, metric === 'count' ? 'Aufgaben' : 'Punkte']}
          />
          <Line type="monotone" dataKey={dataKey} stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#818cf8' }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (mode === 'comparison' && comparisonData) {
    const userKey = metric === 'count' ? 'userCount' : 'userPoints'
    const partnerKey = metric === 'count' ? 'partnerCount' : 'partnerPoints'
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={(v: string) => v}
            formatter={(value: number, name: string) => [
              value,
              name === userKey ? (userName ?? 'Ich') : (partnerName ?? 'Partner'),
            ]}
          />
          <Bar dataKey={userKey} stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} name={userKey} />
          <Bar dataKey={partnerKey} stackId="a" fill="#f472b6" radius={[4, 4, 0, 0]} name={partnerKey} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return null
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/activity-chart.tsx
git commit -m "feat(stats): add activity chart with line and stacked bar modes"
```

---

### Task 5: Stats Client Component

**Files:**
- Create: `src/app/(app)/stats/stats-client.tsx`

- [ ] **Step 1: Create the StatsClient component**

This is the main client component that handles tab switching, date picker, task filter, Y-axis toggle, and renders the grid layout with all chart components.

```typescript
// src/app/(app)/stats/stats-client.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { SummaryCards } from '@/components/stats/summary-cards'
import { ActivityChart } from '@/components/stats/activity-chart'
import { Scoreboard } from '@/components/stats/scoreboard'
import { TopTasks } from '@/components/stats/top-tasks'
import { TaskFilter } from '@/components/stats/task-filter'
import { Heatmap } from '@/components/stats/heatmap'
import { CategoryPieChart } from '@/components/stats/category-pie-chart'
import {
  groupByDay, groupByWeek, groupByCategory, topTasks as computeTopTasks,
  buildHeatmap, buildScoreboard,
} from '@/lib/stats'

type Completion = {
  id: string
  completedAt: string // ISO string from server
  points: number
  userId: string
  taskId: string
  task: { id: string; title: string; emoji: string; categoryId: string }
}

type StatsClientProps = {
  completions: Completion[]
  users: { id: string; name: string }[]
  currentUserId: string
  categories: { id: string; name: string; emoji: string }[]
  allTasks: { id: string; title: string; emoji: string }[]
  from: string
  to: string
}

function parseDates(completions: Completion[]) {
  return completions.map((c) => ({ ...c, completedAt: new Date(c.completedAt) }))
}

function daysBetween(from: string, to: string): number {
  const start = new Date(from + 'T00:00:00Z')
  const end = new Date(to + 'T00:00:00Z')
  return Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
}

export function StatsClient({ completions, users, currentUserId, categories, allTasks, from, to }: StatsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'personal'
  const [metric, setMetric] = useState<'count' | 'points'>('count')
  const [filterTaskId, setFilterTaskId] = useState<string | null>(null)

  const parsed = useMemo(() => parseDates(completions), [completions])

  const filtered = useMemo(() => {
    if (!filterTaskId) return parsed
    return parsed.filter((c) => c.taskId === filterTaskId)
  }, [parsed, filterTaskId])

  const partner = users.find((u) => u.id !== currentUserId)
  const numDays = daysBetween(from, to)
  const useWeeks = numDays > 60

  function setTab(newTab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', newTab)
    router.push(`/stats?${params.toString()}`)
    setFilterTaskId(null)
  }

  function setDateRange(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', newFrom)
    params.set('to', newTo)
    router.push(`/stats?${params.toString()}`)
  }

  // Personal tab data
  const myCompletions = useMemo(() => filtered.filter((c) => c.userId === currentUserId), [filtered, currentUserId])
  const myDayData = useMemo(() => groupByDay(myCompletions), [myCompletions])
  const myWeekData = useMemo(() => groupByWeek(myCompletions), [myCompletions])
  const myTotalTasks = myCompletions.length
  const myTotalPoints = myCompletions.reduce((s, c) => s + c.points, 0)
  const myAvgPerDay = numDays > 0 ? myTotalTasks / numDays : 0
  const myCategoryData = useMemo(() => groupByCategory(myCompletions as any, categories), [myCompletions, categories])
  const myTopTasks = useMemo(() => computeTopTasks(myCompletions as any), [myCompletions])
  const myHeatmap = useMemo(() => buildHeatmap(myCompletions as any), [myCompletions])

  // Comparison tab data
  const scoreboard = useMemo(() => buildScoreboard(filtered as any, users), [filtered, users])
  const comparisonDayData = useMemo(() => {
    const userDays = groupByDay(filtered as any, currentUserId)
    const partnerDays = partner ? groupByDay(filtered as any, partner.id) : []
    const allDates = new Set([...userDays.map((d) => d.date), ...partnerDays.map((d) => d.date)])
    return Array.from(allDates).sort().map((date) => {
      const u = userDays.find((d) => d.date === date)
      const p = partnerDays.find((d) => d.date === date)
      return {
        date,
        userCount: u?.count ?? 0, userPoints: u?.points ?? 0,
        partnerCount: p?.count ?? 0, partnerPoints: p?.points ?? 0,
      }
    })
  }, [filtered, currentUserId, partner])
  const comparisonWeekData = useMemo(() => {
    const userWeeks = groupByWeek(filtered as any, currentUserId)
    const partnerWeeks = partner ? groupByWeek(filtered as any, partner.id) : []
    const allWeeks = new Set([...userWeeks.map((w) => w.week), ...partnerWeeks.map((w) => w.week)])
    return Array.from(allWeeks).sort().map((week) => {
      const u = userWeeks.find((w) => w.week === week)
      const p = partnerWeeks.find((w) => w.week === week)
      return {
        date: week,
        userCount: u?.count ?? 0, userPoints: u?.points ?? 0,
        partnerCount: p?.count ?? 0, partnerPoints: p?.points ?? 0,
      }
    })
  }, [filtered, currentUserId, partner])
  const partnerTopTasks = useMemo(() => {
    if (!partner) return []
    const partnerCompletions = filtered.filter((c) => c.userId === partner.id)
    return computeTopTasks(partnerCompletions as any)
  }, [filtered, partner])
  const myTopTasksComparison = useMemo(() => {
    const mine = filtered.filter((c) => c.userId === currentUserId)
    return computeTopTasks(mine as any)
  }, [filtered, currentUserId])
  const userHeatmap = useMemo(() => {
    const mine = filtered.filter((c) => c.userId === currentUserId)
    return buildHeatmap(mine as any)
  }, [filtered, currentUserId])
  const partnerHeatmap = useMemo(() => {
    if (!partner) return {}
    const theirs = filtered.filter((c) => c.userId === partner.id)
    return buildHeatmap(theirs as any)
  }, [filtered, partner])
  const userCategoryData = useMemo(() => {
    const mine = filtered.filter((c) => c.userId === currentUserId)
    return groupByCategory(mine as any, categories)
  }, [filtered, currentUserId, categories])
  const partnerCategoryData = useMemo(() => {
    if (!partner) return []
    const theirs = filtered.filter((c) => c.userId === partner.id)
    return groupByCategory(theirs as any, categories)
  }, [filtered, partner, categories])

  const me = users.find((u) => u.id === currentUserId)

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Statistiken</h1>

      {/* Tab pills */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('personal')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'personal' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Persönlich
        </button>
        <button
          onClick={() => setTab('comparison')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'comparison' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vergleich
        </button>
      </div>

      {/* Date picker */}
      <div className="flex gap-2 mb-6">
        <input
          type="date"
          value={from}
          onChange={(e) => setDateRange(e.target.value, to)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <span className="text-slate-400 self-center">—</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setDateRange(from, e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {tab === 'personal' ? (
        <div className="space-y-4">
          {/* Row 1: Summary cards */}
          <SummaryCards taskCount={myTotalTasks} totalPoints={myTotalPoints} avgPerDay={myAvgPerDay} />

          {/* Row 2: Activity chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Aktivitäts-Verlauf</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setMetric('count')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'count' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Aufgaben
                </button>
                <button
                  onClick={() => setMetric('points')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'points' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Punkte
                </button>
              </div>
            </div>
            <ActivityChart
              mode="personal"
              metric={metric}
              personalData={useWeeks ? myWeekData.map((w) => ({ date: w.week, count: w.count, points: w.points })) : myDayData}
            />
          </div>

          {/* Row 3: Category + Top Tasks (2 col grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Kategorie-Verteilung</h2>
              <CategoryPieChart
                byCategory={Object.fromEntries(myCategoryData.map((c) => [c.categoryId, { [me?.name ?? 'Ich']: c.count }]))}
                categories={categories}
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Top-Aufgaben</h2>
              <TopTasks tasks={myTopTasks} />
            </div>
          </div>

          {/* Row 4: Heatmap */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Heatmap</h2>
            <Heatmap data={myHeatmap} from={from} to={to} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: Scoreboard */}
          <Scoreboard entries={scoreboard} />

          {/* Row 2: Filter + Activity chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-700">Aktivitäts-Verlauf</h2>
                <TaskFilter tasks={allTasks} value={filterTaskId} onChange={setFilterTaskId} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setMetric('count')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'count' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Aufgaben
                </button>
                <button
                  onClick={() => setMetric('points')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'points' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Punkte
                </button>
              </div>
            </div>
            <ActivityChart
              mode="comparison"
              metric={metric}
              comparisonData={useWeeks ? comparisonWeekData : comparisonDayData}
              userName={me?.name ?? 'Ich'}
              partnerName={partner?.name ?? 'Partner'}
            />
          </div>

          {/* Row 3: Category + Top Tasks (2 col grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Kategorie-Verteilung</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 mb-1">{me?.name ?? 'Ich'}</p>
                  <CategoryPieChart
                    byCategory={Object.fromEntries(userCategoryData.map((c) => [c.categoryId, { [me?.name ?? 'Ich']: c.count }]))}
                    categories={categories}
                  />
                </div>
                {partner && (
                  <div>
                    <p className="text-xs font-semibold text-pink-600 mb-1">{partner.name}</p>
                    <CategoryPieChart
                      byCategory={Object.fromEntries(partnerCategoryData.map((c) => [c.categoryId, { [partner.name]: c.count }]))}
                      categories={categories}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Top-Aufgaben</h2>
              <div className="space-y-4">
                <TopTasks tasks={myTopTasksComparison} barColor="bg-indigo-400" label={`${me?.name ?? 'Ich'} Top 5`} />
                {partner && (
                  <TopTasks tasks={partnerTopTasks} barColor="bg-pink-400" label={`${partner.name} Top 5`} />
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Heatmaps */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Heatmaps</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-indigo-600 mb-1">{me?.name ?? 'Ich'}</p>
                <Heatmap data={userHeatmap} from={from} to={to} />
              </div>
              {partner && (
                <div>
                  <p className="text-xs font-semibold text-pink-600 mb-1">{partner.name}</p>
                  <Heatmap data={partnerHeatmap} from={from} to={to} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build`
Expected: Build passes (component is not yet used by a page, but should compile)

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/stats/stats-client.tsx
git commit -m "feat(stats): add main stats client component with tabs, filters, and grid layout"
```

---

### Task 6: Stats Server Page

**Files:**
- Create: `src/app/(app)/stats/page.tsx`

- [ ] **Step 1: Create the server page**

```typescript
// src/app/(app)/stats/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatsClient } from './stats-client'

export default async function StatsPage({ searchParams }: { searchParams: { tab?: string; from?: string; to?: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const now = new Date()
  const defaultFrom = new Date(now)
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 30)

  const from = searchParams.from ?? defaultFrom.toISOString().slice(0, 10)
  const to = searchParams.to ?? now.toISOString().slice(0, 10)

  const fromDate = new Date(from + 'T00:00:00Z')
  const toDate = new Date(to + 'T23:59:59.999Z')

  const [completions, users, categories, tasks] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { completedAt: { gte: fromDate, lte: toDate } },
      include: {
        task: { select: { id: true, title: true, emoji: true, categoryId: true } },
      },
      orderBy: { completedAt: 'asc' },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true, emoji: true } }),
    prisma.task.findMany({
      where: { status: 'active' },
      select: { id: true, title: true, emoji: true },
      orderBy: { title: 'asc' },
    }),
  ])

  const serialized = completions.map((c) => ({
    id: c.id,
    completedAt: c.completedAt.toISOString(),
    points: c.points,
    userId: c.userId,
    taskId: c.taskId,
    task: c.task,
  }))

  return (
    <StatsClient
      completions={serialized}
      users={users}
      currentUserId={userId}
      categories={categories}
      allTasks={tasks}
      from={from}
      to={to}
    />
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/stats/page.tsx
git commit -m "feat(stats): add server page with Prisma data loading"
```

---

### Task 7: Dashboard Link + Integration Test

**Files:**
- Modify: `src/app/(app)/page.tsx:194-200`

- [ ] **Step 1: Add "Alle Statistiken →" link below WeekChart**

In `src/app/(app)/page.tsx`, find the `<WeekChart>` block and add a link right after it, before `<GroupedFeed>`:

Replace the existing WeekChart usage:
```tsx
      <WeekChart
        days={weekDays}
        userName={me.name ?? 'Ich'}
        partnerName={partner?.name ?? 'Partner'}
      />
```

With:
```tsx
      <WeekChart
        days={weekDays}
        userName={me.name ?? 'Ich'}
        partnerName={partner?.name ?? 'Partner'}
      />
      <div className="flex justify-end -mt-2 mb-4">
        <Link href="/stats" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
          Alle Statistiken →
        </Link>
      </div>
```

Note: `Link` from `next/link` is already imported at the top of the file.

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (including new stats tests)

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build passes

- [ ] **Step 4: Manual verification**

Run: `npx next dev -p 3001`

1. Open http://localhost:3001 — Dashboard should show "Alle Statistiken →" link below the WeekChart
2. Click the link — should navigate to /stats
3. Verify Personal tab: Summary cards, line chart, category pie chart, top tasks, heatmap
4. Switch Y-axis toggle between "Aufgaben" and "Punkte"
5. Change date range — page reloads with new data
6. Switch to Comparison tab: Scoreboard, stacked bar chart, dual pie charts, dual top tasks, dual heatmaps
7. Use task filter dropdown — all charts should update
8. Verify mobile layout (narrow browser): grid collapses to single column

- [ ] **Step 5: Commit**

```bash
git add src/app/\(app\)/page.tsx
git commit -m "feat(stats): add dashboard link to stats page and verify integration"
```
