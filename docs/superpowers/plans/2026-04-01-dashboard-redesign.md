# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard from a simple points display + feed into a motivating hub with stat pills, today's tasks with quick-actions, a weekly comparison chart, and a grouped activity feed.

**Architecture:** The dashboard page (`src/app/(app)/page.tsx`) remains a Server Component that loads all data via Prisma and passes it to four new components: `StatPills` (server), `TodaySection` (client, for complete buttons), `WeekChart` (server), and `GroupedFeed` (client, for collapsible groups). Existing `PointsHeader` and `FeedItem` are deleted.

**Tech Stack:** Next.js 14 App Router, Prisma 7 + SQLite, React Server/Client Components, Tailwind CSS, Vitest

---

### Task 1: Helper — getDueTasks and getTodaySummary

**Files:**
- Create: `src/lib/dashboard.ts`
- Create: `src/tests/lib/dashboard.test.ts`

This task creates the core data-fetching logic for the today section and weekly chart, extracted as testable pure functions where possible.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/tests/lib/dashboard.test.ts
import { describe, it, expect } from 'vitest'
import { groupFeedByDay, getWeekBounds } from '@/lib/dashboard'

describe('getWeekBounds', () => {
  it('returns Monday 00:00 to Sunday 23:59 for a Wednesday', () => {
    // Wednesday 2026-04-01
    const date = new Date('2026-04-01T14:00:00Z')
    const { start, end } = getWeekBounds(date)
    expect(start.toISOString()).toBe('2026-03-30T00:00:00.000Z') // Monday
    expect(end.getUTCDay()).toBe(0) // Sunday
    expect(end.getUTCHours()).toBe(23)
  })

  it('returns correct bounds when date is Monday', () => {
    const date = new Date('2026-03-30T08:00:00Z') // Monday
    const { start } = getWeekBounds(date)
    expect(start.toISOString()).toBe('2026-03-30T00:00:00.000Z')
  })

  it('returns correct bounds when date is Sunday', () => {
    const date = new Date('2026-04-05T20:00:00Z') // Sunday
    const { start, end } = getWeekBounds(date)
    expect(start.toISOString()).toBe('2026-03-30T00:00:00.000Z')
    expect(end.toISOString().slice(0, 10)).toBe('2026-04-05')
  })
})

describe('groupFeedByDay', () => {
  const now = new Date('2026-04-01T18:00:00Z')

  it('groups entries into today, yesterday, this week, last week', () => {
    const entries = [
      { id: '1', at: '2026-04-01T10:00:00Z' }, // today
      { id: '2', at: '2026-03-31T10:00:00Z' }, // yesterday
      { id: '3', at: '2026-03-30T10:00:00Z' }, // this week (Monday)
      { id: '4', at: '2026-03-25T10:00:00Z' }, // last week
    ] as any[]
    const groups = groupFeedByDay(entries, now)
    expect(groups).toHaveLength(4)
    expect(groups[0].label).toBe('Heute')
    expect(groups[0].entries).toHaveLength(1)
    expect(groups[1].label).toBe('Gestern')
    expect(groups[1].entries).toHaveLength(1)
    expect(groups[2].label).toBe('Diese Woche')
    expect(groups[2].entries).toHaveLength(1)
    expect(groups[3].label).toBe('Letzte Woche')
    expect(groups[3].entries).toHaveLength(1)
  })

  it('omits empty groups', () => {
    const entries = [
      { id: '1', at: '2026-04-01T10:00:00Z' },
    ] as any[]
    const groups = groupFeedByDay(entries, now)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Heute')
  })

  it('returns empty array for no entries', () => {
    expect(groupFeedByDay([], now)).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/lib/dashboard.test.ts`
Expected: FAIL — module `@/lib/dashboard` not found

- [ ] **Step 3: Implement the helper functions**

```typescript
// src/lib/dashboard.ts

export type FeedEntry = {
  id: string
  type: 'completion' | 'redemption'
  user: { id: string; name: string }
  task?: { title: string; emoji: string }
  item?: { title: string; emoji: string }
  points: number
  at: string
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
    { label: 'Heute', entries: [] },
    { label: 'Gestern', entries: [] },
    { label: 'Diese Woche', entries: [] },
    { label: 'Letzte Woche', entries: [] },
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/lib/dashboard.test.ts`
Expected: PASS — all 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboard.ts src/tests/lib/dashboard.test.ts
git commit -m "feat: add dashboard helper functions (getWeekBounds, groupFeedByDay)"
```

---

### Task 2: StatPills Component

**Files:**
- Create: `src/components/dashboard/stat-pills.tsx`

- [ ] **Step 1: Create the StatPills server component**

```typescript
// src/components/dashboard/stat-pills.tsx
import { LEVELS } from '@/lib/points'

type StatPillsProps = {
  streakDays: number
  level: number
  levelTitle: string
  totalEarned: number
  balance: number
}

export function StatPills({ streakDays, level, levelTitle, totalEarned, balance }: StatPillsProps) {
  const currentLevel = LEVELS.find((l) => l.level === level) ?? LEVELS[0]
  const nextLevel = LEVELS.find((l) => l.level === level + 1)
  const progressPercent = nextLevel
    ? Math.round(((totalEarned - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalEarned : 0

  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] gap-3 mb-4">
      {/* Streak */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center">
        <span className="text-2xl">🔥</span>
        <span className="text-2xl font-bold text-slate-800">{streakDays}</span>
        <span className="text-[10px] text-slate-500">Streak</span>
      </div>

      {/* Level Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-slate-800">Lv.{level} {levelTitle}</span>
          <span className="text-xs text-indigo-600 font-semibold">{progressPercent}%</span>
        </div>
        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {nextLevel ? `${pointsToNext} Pkt bis ${nextLevel.title}` : 'Max Level erreicht!'}
        </p>
      </div>

      {/* Points */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center">
        <span className="text-2xl">💰</span>
        <span className="text-2xl font-bold text-slate-800">{balance.toLocaleString()}</span>
        <span className="text-[10px] text-slate-500">Punkte</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/stat-pills.tsx
git commit -m "feat: add StatPills component for dashboard"
```

---

### Task 3: TodaySection Component

**Files:**
- Create: `src/components/dashboard/today-section.tsx`

- [ ] **Step 1: Create the TodaySection client component**

```typescript
// src/components/dashboard/today-section.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Check } from 'lucide-react'

type CompletedTask = {
  id: string
  emoji: string
  title: string
  points: number
}

type DueTask = {
  id: string
  emoji: string
  title: string
  points: number
}

type SuggestedTask = {
  id: string
  emoji: string
  title: string
}

type TodaySectionProps = {
  completed: CompletedTask[]
  due: DueTask[]
  suggestions: SuggestedTask[]
}

export function TodaySection({ completed, due, suggestions }: TodaySectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())

  const totalTasks = completed.length + due.length
  const doneCount = completed.length + doneIds.size

  async function handleComplete(task: DueTask) {
    setLoadingId(task.id)
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDoneIds((prev) => new Set(prev).add(task.id))
      toast(`+${task.points} Pkt für "${task.title}"`, 'success')

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(`${a.emoji} Achievement freigeschaltet: ${a.title}`, 'success')
          }, 1500 + i * 1500)
        })
      }

      router.refresh()
    } catch {
      toast('Fehler beim Erledigen', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Heute</h2>
        <span className="bg-green-50 text-green-700 text-xs font-semibold rounded-full px-2 py-0.5">
          {doneCount}/{totalTasks} erledigt
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {/* Completed tasks */}
        {completed.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 bg-green-50 rounded-lg border-l-[3px] border-green-500">
            <span className="text-lg">{t.emoji}</span>
            <span className="flex-1 text-sm text-slate-400 line-through truncate">{t.title}</span>
            <span className="text-xs text-green-600 font-semibold">✓ +{t.points}</span>
          </div>
        ))}
        {/* Due tasks */}
        {due.filter((t) => !doneIds.has(t.id)).map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border-l-[3px] border-slate-300">
            <span className="text-lg">{t.emoji}</span>
            <span className="flex-1 text-sm text-slate-800 truncate">{t.title}</span>
            <button
              onClick={() => handleComplete(t)}
              disabled={loadingId === t.id}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {loadingId === t.id ? '…' : <><Check size={14} /> Abhaken</>}
            </button>
          </div>
        ))}
        {/* Suggested tasks */}
        {suggestions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-lg border-l-[3px] border-amber-400 opacity-70">
            <span className="text-lg">{t.emoji}</span>
            <span className="flex-1 text-sm text-amber-900 truncate">{t.title}</span>
            <span className="text-[10px] text-amber-600 font-semibold">Vorschlag</span>
          </div>
        ))}
        {/* Empty state */}
        {completed.length === 0 && due.length === 0 && suggestions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Keine Aufgaben für heute</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/today-section.tsx
git commit -m "feat: add TodaySection component with quick-complete buttons"
```

---

### Task 4: WeekChart Component

**Files:**
- Create: `src/components/dashboard/week-chart.tsx`

- [ ] **Step 1: Create the WeekChart server component**

```typescript
// src/components/dashboard/week-chart.tsx

type DayData = {
  day: string // 'Mo', 'Di', etc.
  userCount: number
  partnerCount: number
  isFuture: boolean
}

type WeekChartProps = {
  days: DayData[]
  userName: string
  partnerName: string
}

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export function WeekChart({ days, userName, partnerName }: WeekChartProps) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.userCount, d.partnerCount)))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Wochenübersicht
      </h2>
      <div className="flex items-end gap-1.5" style={{ height: '80px' }}>
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
            <div className="flex gap-[2px] w-full items-end" style={{ height: '60px' }}>
              <div
                className={`flex-1 rounded-t-sm ${d.isFuture ? 'bg-slate-100' : 'bg-indigo-400'}`}
                style={{ height: `${d.isFuture ? 4 : Math.max(4, (d.userCount / max) * 60)}px` }}
              />
              <div
                className={`flex-1 rounded-t-sm ${d.isFuture ? 'bg-slate-100' : 'bg-pink-400'}`}
                style={{ height: `${d.isFuture ? 4 : Math.max(4, (d.partnerCount / max) * 60)}px` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
          <span className="text-[10px] text-slate-500">{userName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-pink-400" />
          <span className="text-[10px] text-slate-500">{partnerName}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/week-chart.tsx
git commit -m "feat: add WeekChart component for dashboard"
```

---

### Task 5: GroupedFeed Component

**Files:**
- Create: `src/components/dashboard/grouped-feed.tsx`

- [ ] **Step 1: Create the GroupedFeed client component**

```typescript
// src/components/dashboard/grouped-feed.tsx
'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { FeedGroup, FeedEntry } from '@/lib/dashboard'

function FeedRow({ entry, currentUserId }: { entry: FeedEntry; currentUserId: string }) {
  const isMe = entry.user.id === currentUserId
  const nameColor = isMe ? 'text-indigo-600' : 'text-pink-600'
  const emoji = entry.type === 'redemption' ? (entry.item?.emoji ?? '🎁') : (entry.task?.emoji ?? '✅')
  const title = entry.type === 'redemption' ? (entry.item?.title ?? '') : (entry.task?.title ?? '')

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm border-b border-slate-50 last:border-b-0">
      <span className="text-base">{emoji}</span>
      <span className={`font-semibold ${nameColor}`}>{entry.user.name}</span>
      <span className="text-slate-600 truncate flex-1">{title}</span>
      {entry.type === 'redemption' ? (
        <span className="text-xs font-semibold text-amber-600 whitespace-nowrap">Belohnung</span>
      ) : (
        <span className={`text-xs font-semibold whitespace-nowrap ${nameColor}`}>+{entry.points}</span>
      )}
    </div>
  )
}

export function GroupedFeed({ groups, currentUserId }: { groups: FeedGroup[]; currentUserId: string }) {
  // "Heute" and "Gestern" start expanded, rest collapsed
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const g of groups) {
      init[g.label] = g.label !== 'Heute' && g.label !== 'Gestern'
    }
    return init
  })

  function toggle(label: string) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🚀</p>
        <p className="text-lg font-semibold text-slate-700">Noch keine Aktivitäten</p>
        <p className="text-sm text-slate-400 mt-1">
          Erledige deine erste Aufgabe und starte das Spiel!
        </p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Aktivitäten
      </h2>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {groups.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggle(group.label)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-left hover:bg-slate-100 transition-colors"
            >
              {collapsed[group.label] ? <ChevronRight size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              <span className="text-xs font-semibold text-slate-600 flex-1">{group.label}</span>
              {collapsed[group.label] && (
                <span className="text-[10px] text-slate-400">
                  {group.totalTasks} Aufgaben · {group.totalPoints} Pkt
                </span>
              )}
            </button>
            {!collapsed[group.label] && (
              <div>
                {group.entries.map((entry) => (
                  <FeedRow key={entry.id} entry={entry} currentUserId={currentUserId} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/grouped-feed.tsx
git commit -m "feat: add GroupedFeed component with collapsible day groups"
```

---

### Task 6: Rewrite page.tsx — Data Loading and Assembly

**Files:**
- Modify: `src/app/(app)/page.tsx`
- Delete: `src/components/dashboard/points-header.tsx`
- Delete: `src/components/dashboard/feed-item.tsx`

- [ ] **Step 1: Rewrite page.tsx with all new data loading and components**

```typescript
// src/app/(app)/page.tsx
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel, getCurrentPoints } from '@/lib/points'
import { computeStats } from '@/lib/achievements'
import { getWeekBounds, groupFeedByDay } from '@/lib/dashboard'
import type { FeedEntry } from '@/lib/dashboard'
import { StatPills } from '@/components/dashboard/stat-pills'
import { TodaySection } from '@/components/dashboard/today-section'
import { WeekChart } from '@/components/dashboard/week-chart'
import { GroupedFeed } from '@/components/dashboard/grouped-feed'
import { DashboardNotifications } from '@/components/dashboard/dashboard-notifications'

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  // --- Stat Pills Data ---
  const stats = await computeStats(userId)
  const levelInfo = getLevel(stats.totalPointsEarned)
  const spent = await prisma.purchase.aggregate({
    where: { userId },
    _sum: { pointsSpent: true },
  })
  const balance = getCurrentPoints(stats.totalPointsEarned, spent._sum.pointsSpent ?? 0)

  // --- Partner ---
  const users = await prisma.user.findMany({
    include: {
      completions: { select: { points: true } },
      userAchievements: { select: { id: true } },
    },
  })
  const me = users.find((u) => u.id === userId)!
  const partner = users.find((u) => u.id !== userId)
  const partnerLevel = partner ? getLevel(getTotalEarned(partner.completions)) : null
  const partnerAchievementCount = partner ? partner.userAchievements.length : 0

  // --- Today Section Data ---
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // Today's completions by current user
  const todayCompletions = await prisma.taskCompletion.findMany({
    where: { userId, completedAt: { gte: todayStart } },
    include: { task: { select: { id: true, emoji: true, title: true, points: true } } },
  })
  const completedToday = todayCompletions.map((c) => ({
    id: c.id,
    emoji: c.task.emoji,
    title: c.task.title,
    points: c.points,
  }))
  const completedTaskIds = new Set(todayCompletions.map((c) => c.taskId))

  // Due recurring tasks
  const now = new Date()
  const recurringTasks = await prisma.task.findMany({
    where: {
      status: 'active',
      isRecurring: true,
      OR: [
        { nextDueAt: null },
        { nextDueAt: { lte: now } },
      ],
    },
    select: { id: true, emoji: true, title: true, points: true },
  })
  const dueTasks = recurringTasks.filter((t) => !completedTaskIds.has(t.id))

  // Suggestions: random non-recurring tasks never completed by user, only if <3 due
  let suggestions: { id: string; emoji: string; title: string }[] = []
  if (dueTasks.length < 3) {
    const completedEver = await prisma.taskCompletion.findMany({
      where: { userId },
      select: { taskId: true },
      distinct: ['taskId'],
    })
    const completedEverIds = new Set(completedEver.map((c) => c.taskId))

    const candidates = await prisma.task.findMany({
      where: {
        status: 'active',
        isRecurring: false,
      },
      select: { id: true, emoji: true, title: true },
    })
    const eligible = candidates.filter((t) => !completedEverIds.has(t.id))
    // Shuffle and take up to 2
    const shuffled = eligible.sort(() => Math.random() - 0.5)
    suggestions = shuffled.slice(0, 2)
  }

  // --- Week Chart Data ---
  const { start: weekStart, end: weekEnd } = getWeekBounds(now)
  const weekCompletions = await prisma.taskCompletion.findMany({
    where: { completedAt: { gte: weekStart, lte: weekEnd } },
    select: { userId: true, completedAt: true },
  })
  const todayDayIndex = now.getUTCDay() === 0 ? 6 : now.getUTCDay() - 1 // 0=Mon

  const weekDays = DAY_LABELS.map((day, i) => {
    const dayDate = new Date(weekStart)
    dayDate.setUTCDate(dayDate.getUTCDate() + i)
    const dayKey = dayDate.toISOString().slice(0, 10)

    const dayCompletions = weekCompletions.filter(
      (c) => c.completedAt.toISOString().slice(0, 10) === dayKey
    )

    return {
      day,
      userCount: dayCompletions.filter((c) => c.userId === userId).length,
      partnerCount: partner ? dayCompletions.filter((c) => c.userId === partner.id).length : 0,
      isFuture: i > todayDayIndex,
    }
  })

  // --- Feed Data ---
  const completions = await prisma.taskCompletion.findMany({
    take: 30,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { title: true, emoji: true } },
    },
  })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14) // 2 weeks for "last week" group

  const recentRedemptions = await prisma.purchase.findMany({
    where: { redeemedAt: { not: null, gte: sevenDaysAgo } },
    orderBy: { redeemedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      item: { select: { title: true, emoji: true } },
    },
  })

  const feedEntries: FeedEntry[] = [
    ...completions.map((c) => ({
      id: c.id,
      type: 'completion' as const,
      user: { id: c.user.id, name: c.user.name ?? 'Unbekannt' },
      task: c.task,
      points: c.points,
      at: c.completedAt.toISOString(),
    })),
    ...recentRedemptions.map((p) => ({
      id: p.id,
      type: 'redemption' as const,
      user: { id: p.user.id, name: p.user.name ?? 'Unbekannt' },
      item: p.item,
      points: 0,
      at: p.redeemedAt!.toISOString(),
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const feedGroups = groupFeedByDay(feedEntries, now)

  return (
    <div>
      <DashboardNotifications />
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <StatPills
        streakDays={stats.currentStreakDays}
        level={levelInfo.level}
        levelTitle={levelInfo.title}
        totalEarned={stats.totalPointsEarned}
        balance={balance}
      />

      {partner && partnerLevel && (
        <Link href={`/profile/${partner.id}`}>
          <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="text-2xl">👫</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{partner.name ?? 'Unbekannt'}</p>
              <p className="text-xs text-slate-500">{partnerLevel.title} · {partnerAchievementCount} Erfolge</p>
            </div>
            <span className="text-slate-400 text-sm">›</span>
          </div>
        </Link>
      )}

      <TodaySection
        completed={completedToday}
        due={dueTasks}
        suggestions={suggestions}
      />

      <WeekChart
        days={weekDays}
        userName={me.name ?? 'Ich'}
        partnerName={partner?.name ?? 'Partner'}
      />

      <GroupedFeed groups={feedGroups} currentUserId={userId} />
    </div>
  )
}
```

- [ ] **Step 2: Delete old components**

```bash
rm src/components/dashboard/points-header.tsx
rm src/components/dashboard/feed-item.tsx
```

- [ ] **Step 3: Verify no other files import the deleted components**

Run: `grep -r "points-header\|PointsHeader\|feed-item\|FeedItem" src/ --include="*.tsx" --include="*.ts"`
Expected: No results (only page.tsx imported them, which was rewritten)

- [ ] **Step 4: Commit**

```bash
git add -A src/app/\(app\)/page.tsx src/components/dashboard/
git commit -m "feat: rewrite dashboard with stat pills, today section, week chart, grouped feed"
```

---

### Task 7: Integration Test — Verify App Builds and Runs

**Files:**
- None (verification only)

- [ ] **Step 1: Run all existing tests**

Run: `npx vitest run`
Expected: All tests pass (including new dashboard.test.ts)

- [ ] **Step 2: Build the app**

Run: `npx next build`
Expected: Build succeeds with no type errors

- [ ] **Step 3: Start dev server and verify visually**

Run: `npx next dev --port 3001`
Navigate to `http://localhost:3001`, log in (Franz, PIN 1234).

Verify:
- Stat pills show streak, level progress, and points
- Partner link card appears below stat pills
- Today section shows completed tasks (green), due tasks with "Abhaken" buttons, and suggestions (amber)
- Week chart shows bars for both users
- Grouped feed shows "Heute" and "Gestern" expanded, older groups collapsed
- Clicking "Abhaken" on a due task completes it and moves it to the completed section
- Empty states render correctly

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: dashboard integration fixes"
```
