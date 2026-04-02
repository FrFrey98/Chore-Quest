# Streak-Erweiterung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing streak system with percentage-based point bonuses, a paid streak restore mechanic, and a dedicated streak detail page.

**Architecture:** New `StreakState` Prisma model persists streak data per user. Central `src/lib/streak.ts` module consolidates all streak logic (replacing 3 duplicated calculations). Task completion route applies bonus points and updates streak state. New `/streak` page shows full streak details with restore functionality.

**Tech Stack:** Next.js 14, Prisma (SQLite), TypeScript, Tailwind CSS, Vitest

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `prisma/schema.prisma` | Modify | Add `StreakState` model, add relation to `User` |
| `src/lib/streak.ts` | Create | All streak logic: tiers, bonus calc, restore price, state updates |
| `src/tests/lib/streak.test.ts` | Create | Unit tests for all pure streak functions |
| `src/app/api/streak/route.ts` | Create | GET endpoint: streak state, bonus, restore availability |
| `src/app/api/streak/restore/route.ts` | Create | POST endpoint: execute streak restore |
| `src/app/api/tasks/[id]/complete/route.ts` | Modify | Apply bonus points, update streak state |
| `src/lib/achievements.ts` | Modify | Use streak lib instead of inline calculation |
| `src/lib/profile-stats.ts` | Modify | Use streak lib instead of inline calculation |
| `src/app/api/stats/route.ts` | Modify | Use streak lib instead of inline calculation |
| `src/components/dashboard/stat-pills.tsx` | Modify | Add bonus display, restore alert, make clickable |
| `src/app/(app)/streak/page.tsx` | Create | Streak detail page (server component) |
| `src/app/(app)/streak/streak-client.tsx` | Create | Client component for restore interaction |
| `scripts/docker-entrypoint.sh` | Modify | Add `StreakState` table to seed script |

---

### Task 1: Prisma Schema — Add StreakState Model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add StreakState model to schema**

Add the following model at the end of `prisma/schema.prisma`, before the closing of the file:

```prisma
model StreakState {
  id             String    @id @default(cuid())
  userId         String    @unique
  currentStreak  Int       @default(0)
  bestStreak     Int       @default(0)
  lastActiveAt   DateTime?
  restoreCount   Int       @default(0)
  lastRestoredAt DateTime?
  updatedAt      DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Also add the reverse relation to the `User` model. Find the line `userAchievements UserAchievement[]` inside the `User` model and add after it:

```prisma
  streakState      StreakState?
```

- [ ] **Step 2: Generate Prisma client and create migration**

Run:
```bash
npx prisma migrate dev --name add-streak-state
```

Expected: Migration created, Prisma client regenerated. SQLite database updated with new `StreakState` table.

- [ ] **Step 3: Verify migration**

Run:
```bash
npx prisma migrate status
```

Expected: All migrations applied, no pending migrations.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ src/generated/
git commit -m "feat: add StreakState model to Prisma schema"
```

---

### Task 2: Streak Library — Pure Functions

**Files:**
- Create: `src/lib/streak.ts`
- Create: `src/tests/lib/streak.test.ts`

- [ ] **Step 1: Write tests for streak tier/bonus functions**

Create `src/tests/lib/streak.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  STREAK_TIERS,
  getStreakTier,
  applyBonus,
  calculateRestorePrice,
} from '@/lib/streak'

describe('getStreakTier', () => {
  it('returns no bonus for streak 0', () => {
    const tier = getStreakTier(0)
    expect(tier.percent).toBe(0)
    expect(tier.name).toBe('Kein Bonus')
  })

  it('returns no bonus for streak 2', () => {
    expect(getStreakTier(2).percent).toBe(0)
  })

  it('returns 5% for streak 3 (Warm-up)', () => {
    const tier = getStreakTier(3)
    expect(tier.percent).toBe(5)
    expect(tier.name).toBe('Warm-up')
  })

  it('returns 5% for streak 6', () => {
    expect(getStreakTier(6).percent).toBe(5)
  })

  it('returns 10% for streak 7 (Feuer-Starter)', () => {
    const tier = getStreakTier(7)
    expect(tier.percent).toBe(10)
    expect(tier.name).toBe('Feuer-Starter')
  })

  it('returns 10% for streak 13', () => {
    expect(getStreakTier(13).percent).toBe(10)
  })

  it('returns 25% for streak 14 (Wochen-Star)', () => {
    const tier = getStreakTier(14)
    expect(tier.percent).toBe(25)
    expect(tier.name).toBe('Wochen-Star')
  })

  it('returns 50% for streak 30 (Monats-Marathon)', () => {
    const tier = getStreakTier(30)
    expect(tier.percent).toBe(50)
    expect(tier.name).toBe('Monats-Marathon')
  })

  it('returns 50% for streak 100', () => {
    expect(getStreakTier(100).percent).toBe(50)
  })
})

describe('applyBonus', () => {
  it('returns base points when no bonus (streak 0)', () => {
    expect(applyBonus(20, 0)).toBe(20)
  })

  it('applies 5% bonus and floors the result', () => {
    // 20 * 1.05 = 21
    expect(applyBonus(20, 3)).toBe(21)
  })

  it('applies 10% bonus', () => {
    // 20 * 1.10 = 22
    expect(applyBonus(20, 7)).toBe(22)
  })

  it('applies 25% bonus', () => {
    // 20 * 1.25 = 25
    expect(applyBonus(20, 14)).toBe(25)
  })

  it('applies 50% bonus', () => {
    // 20 * 1.50 = 30
    expect(applyBonus(20, 30)).toBe(30)
  })

  it('floors fractional points', () => {
    // 15 * 1.05 = 15.75 → 15
    expect(applyBonus(15, 3)).toBe(15)
  })

  it('floors 10% on odd base points', () => {
    // 25 * 1.10 = 27.5 → 27
    expect(applyBonus(25, 7)).toBe(27)
  })
})

describe('calculateRestorePrice', () => {
  it('returns 20 + 5 * streak', () => {
    expect(calculateRestorePrice(7)).toBe(55)
  })

  it('returns 90 for streak 14', () => {
    expect(calculateRestorePrice(14)).toBe(90)
  })

  it('returns 170 for streak 30', () => {
    expect(calculateRestorePrice(30)).toBe(170)
  })

  it('returns 25 for streak 1', () => {
    expect(calculateRestorePrice(1)).toBe(25)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/tests/lib/streak.test.ts`
Expected: FAIL — module `@/lib/streak` not found.

- [ ] **Step 3: Implement pure streak functions**

Create `src/lib/streak.ts`:

```typescript
export const STREAK_TIERS = [
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 7,  percent: 10, name: 'Feuer-Starter' },
  { minDays: 3,  percent: 5,  name: 'Warm-up' },
  { minDays: 0,  percent: 0,  name: 'Kein Bonus' },
] as const

export type StreakTier = {
  minDays: number
  percent: number
  name: string
}

export function getStreakTier(currentStreak: number): StreakTier {
  return STREAK_TIERS.find((t) => currentStreak >= t.minDays) ?? STREAK_TIERS[STREAK_TIERS.length - 1]
}

export function applyBonus(basePoints: number, currentStreak: number): number {
  const tier = getStreakTier(currentStreak)
  return Math.floor(basePoints * (1 + tier.percent / 100))
}

export function calculateRestorePrice(currentStreak: number): number {
  return 20 + 5 * currentStreak
}

export function getNextTier(currentStreak: number): { tier: StreakTier; daysNeeded: number } | null {
  const currentTier = getStreakTier(currentStreak)
  const nextTier = [...STREAK_TIERS].reverse().find((t) => t.minDays > currentStreak)
  if (!nextTier) return null
  return { tier: nextTier, daysNeeded: nextTier.minDays - currentStreak }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/tests/lib/streak.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Write tests for getNextTier**

Add to the end of `src/tests/lib/streak.test.ts`:

```typescript
import { getNextTier } from '@/lib/streak'

describe('getNextTier', () => {
  it('returns Warm-up tier for streak 0', () => {
    const result = getNextTier(0)
    expect(result).not.toBeNull()
    expect(result!.tier.name).toBe('Warm-up')
    expect(result!.daysNeeded).toBe(3)
  })

  it('returns Feuer-Starter for streak 5', () => {
    const result = getNextTier(5)
    expect(result!.tier.name).toBe('Feuer-Starter')
    expect(result!.daysNeeded).toBe(2)
  })

  it('returns Wochen-Star for streak 7', () => {
    const result = getNextTier(7)
    expect(result!.tier.name).toBe('Wochen-Star')
    expect(result!.daysNeeded).toBe(7)
  })

  it('returns Monats-Marathon for streak 14', () => {
    const result = getNextTier(14)
    expect(result!.tier.name).toBe('Monats-Marathon')
    expect(result!.daysNeeded).toBe(16)
  })

  it('returns null for streak 30 (max tier)', () => {
    expect(getNextTier(30)).toBeNull()
  })

  it('returns null for streak 100', () => {
    expect(getNextTier(100)).toBeNull()
  })
})
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- src/tests/lib/streak.test.ts`
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/streak.ts src/tests/lib/streak.test.ts
git commit -m "feat: add streak library with tier/bonus/restore pure functions"
```

---

### Task 3: Streak State Database Functions

**Files:**
- Modify: `src/lib/streak.ts`

This task adds the database-interacting functions to the streak library. These functions use Prisma and cannot be easily unit-tested without a database, so we test them via the API routes in later tasks.

- [ ] **Step 1: Add database functions to streak.ts**

Add the following to the end of `src/lib/streak.ts`:

```typescript
import { prisma } from '@/lib/prisma'

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

export async function getOrCreateStreakState(userId: string) {
  const existing = await prisma.streakState.findUnique({ where: { userId } })
  if (existing) return existing

  // Initialize from TaskCompletions
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    select: { completedAt: true },
    orderBy: { completedAt: 'asc' },
  })

  if (completions.length === 0) {
    return prisma.streakState.create({
      data: { userId, currentStreak: 0, bestStreak: 0 },
    })
  }

  // Calculate current streak from completions
  const daySet = new Set(completions.map((c) => toDateKey(c.completedAt)))
  let currentStreak = 0
  const today = new Date()
  const todayKey = toDateKey(today)
  const startDay = daySet.has(todayKey) ? 0 : 1
  for (let i = startDay; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    if (daySet.has(toDateKey(d))) currentStreak++
    else break
  }

  // Calculate best streak from completions
  const sortedDays = [...daySet].sort()
  let bestStreak = 0
  let runLength = 1
  for (let i = 1; i < sortedDays.length; i++) {
    if (daysBetween(sortedDays[i - 1], sortedDays[i]) === 1) {
      runLength++
    } else {
      bestStreak = Math.max(bestStreak, runLength)
      runLength = 1
    }
  }
  bestStreak = Math.max(bestStreak, runLength, currentStreak)

  const lastCompletion = completions[completions.length - 1]

  return prisma.streakState.create({
    data: {
      userId,
      currentStreak,
      bestStreak,
      lastActiveAt: lastCompletion.completedAt,
    },
  })
}

export async function updateStreakOnCompletion(userId: string): Promise<{ currentStreak: number; bonusPercent: number }> {
  const state = await getOrCreateStreakState(userId)
  const todayKey = toDateKey(new Date())
  const lastActiveKey = state.lastActiveAt ? toDateKey(state.lastActiveAt) : null

  let newStreak: number
  if (lastActiveKey === todayKey) {
    // Already completed today — streak stays the same
    newStreak = state.currentStreak
  } else if (lastActiveKey && daysBetween(lastActiveKey, todayKey) === 1) {
    // Consecutive day — increment
    newStreak = state.currentStreak + 1
  } else {
    // Gap of 2+ days — reset to 1
    newStreak = 1
  }

  const newBest = Math.max(state.bestStreak, newStreak)

  await prisma.streakState.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastActiveAt: new Date(),
    },
  })

  return { currentStreak: newStreak, bonusPercent: getStreakTier(newStreak).percent }
}

export async function isRestoreAvailable(
  userId: string
): Promise<{ available: boolean; price: number; currentStreak: number }> {
  const state = await getOrCreateStreakState(userId)

  if (state.currentStreak === 0 || !state.lastActiveAt) {
    return { available: false, price: 0, currentStreak: 0 }
  }

  const todayKey = toDateKey(new Date())
  const lastActiveKey = toDateKey(state.lastActiveAt)
  const gap = daysBetween(lastActiveKey, todayKey)

  // Restore only available if exactly 2 days gap (missed yesterday)
  if (gap !== 2) {
    return { available: false, price: 0, currentStreak: state.currentStreak }
  }

  // Check not already restored today
  if (state.lastRestoredAt && toDateKey(state.lastRestoredAt) === todayKey) {
    return { available: false, price: 0, currentStreak: state.currentStreak }
  }

  const price = calculateRestorePrice(state.currentStreak)

  // Check if user has enough points
  const [completions, purchases] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      select: { points: true },
    }),
    prisma.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    }),
  ])

  const earned = completions.reduce((sum, c) => sum + c.points, 0)
  const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
  const balance = Math.max(0, earned - spent)

  return {
    available: balance >= price,
    price,
    currentStreak: state.currentStreak,
  }
}

export async function executeRestore(userId: string): Promise<{ success: boolean; error?: string }> {
  const restoreInfo = await isRestoreAvailable(userId)
  if (!restoreInfo.available) {
    return { success: false, error: 'Wiederherstellung nicht verfügbar' }
  }

  const state = await prisma.streakState.findUnique({ where: { userId } })
  if (!state) return { success: false, error: 'Kein Streak-State vorhanden' }

  // Create a purchase for the restore cost
  // First, ensure a streak_restore StoreItem exists
  let restoreItem = await prisma.storeItem.findFirst({
    where: { type: 'streak_restore' },
  })
  if (!restoreItem) {
    restoreItem = await prisma.storeItem.create({
      data: {
        title: 'Streak-Wiederherstellung',
        description: 'Stelle deine verlorene Streak wieder her',
        emoji: '🔄',
        pointCost: restoreInfo.price,
        type: 'streak_restore',
        isActive: false, // Not visible in store
      },
    })
  }

  await prisma.$transaction(async (tx) => {
    // Re-verify points inside transaction
    const completions = await tx.taskCompletion.findMany({
      where: { userId },
      select: { points: true },
    })
    const purchases = await tx.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    })
    const earned = completions.reduce((sum, c) => sum + c.points, 0)
    const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
    const balance = Math.max(0, earned - spent)

    if (balance < restoreInfo.price) {
      throw new Error('INSUFFICIENT_POINTS')
    }

    // Create purchase record
    await tx.purchase.create({
      data: {
        itemId: restoreItem!.id,
        userId,
        pointsSpent: restoreInfo.price,
      },
    })

    // Update streak state: keep streak, set lastActiveAt to yesterday
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(23, 59, 59, 0)

    await tx.streakState.update({
      where: { userId },
      data: {
        lastActiveAt: yesterday,
        restoreCount: { increment: 1 },
        lastRestoredAt: new Date(),
      },
    })
  })

  return { success: true }
}
```

Note: The `import { prisma }` statement must be at the top of the file. Move the existing pure function code below it. The final file structure should be:

```
// Top of file:
import { prisma } from '@/lib/prisma'

// Constants (STREAK_TIERS)
// Types (StreakTier)
// Pure functions (getStreakTier, applyBonus, calculateRestorePrice, getNextTier)
// Helper functions (toDateKey, daysBetween)
// Database functions (getOrCreateStreakState, updateStreakOnCompletion, isRestoreAvailable, executeRestore)
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `npm test -- src/tests/lib/streak.test.ts`
Expected: All tests still PASS (import of prisma doesn't break pure function tests in vitest node environment).

- [ ] **Step 3: Commit**

```bash
git add src/lib/streak.ts
git commit -m "feat: add streak state database functions (init, update, restore)"
```

---

### Task 4: Modify Task Completion Route — Apply Bonus & Update Streak

**Files:**
- Modify: `src/app/api/tasks/[id]/complete/route.ts`

- [ ] **Step 1: Update the completion route to use streak bonus**

Replace the entire contents of `src/app/api/tasks/[id]/complete/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextDueAt } from '@/lib/recurring'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { applyBonus, updateStreakOnCompletion } from '@/lib/streak'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task || task.status !== 'active') {
    return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
  }

  // Update streak state and get current streak for bonus calculation
  const { currentStreak } = await updateStreakOnCompletion(session.user.id)
  const pointsWithBonus = applyBonus(task.points, currentStreak)

  const completion = await prisma.taskCompletion.create({
    data: { taskId: task.id, userId: session.user.id, points: pointsWithBonus },
  })

  if (task.isRecurring && task.recurringInterval) {
    const nextDueAt = getNextDueAt(task.recurringInterval, new Date())
    await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
  } else {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'archived' },
    })
  }

  // Check for newly unlocked achievements
  let newAchievements: { id: string; title: string; emoji: string }[] = []
  try {
    const newAchievementIds = await checkAndUnlockAchievements(session.user.id)
    if (newAchievementIds.length > 0) {
      newAchievements = await prisma.achievement.findMany({
        where: { id: { in: newAchievementIds } },
        select: { id: true, title: true, emoji: true },
        orderBy: { sortOrder: 'asc' },
      })
    }
  } catch {
    // Achievement check failure should not block the completion response
  }

  return NextResponse.json({
    ...completion,
    basePoints: task.points,
    bonusPoints: pointsWithBonus - task.points,
    streakDays: currentStreak,
    newAchievements,
  }, { status: 201 })
}
```

- [ ] **Step 2: Run existing tests**

Run: `npm test`
Expected: All existing tests pass. The completion route tests (if any) may need updating if they assert exact point values.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/tasks/[id]/complete/route.ts
git commit -m "feat: apply streak bonus on task completion and update streak state"
```

---

### Task 5: Refactor Existing Streak Calculations to Use Streak Library

**Files:**
- Modify: `src/lib/achievements.ts`
- Modify: `src/lib/profile-stats.ts`
- Modify: `src/app/api/stats/route.ts`

- [ ] **Step 1: Refactor achievements.ts**

In `src/lib/achievements.ts`, replace the `computeStats` function. Replace the streak calculation block (lines 51-62, the `// Calculate streak` section) with a call to `getOrCreateStreakState`:

Replace the entire `computeStats` function with:

```typescript
export async function computeStats(userId: string): Promise<AchievementStats> {
  const [completions, streakState] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      include: { task: { select: { categoryId: true } } },
      orderBy: { completedAt: 'asc' },
    }),
    getOrCreateStreakState(userId),
  ])

  const totalTaskCount = completions.length
  const totalPointsEarned = getTotalEarned(completions)
  const currentLevel = getLevel(totalPointsEarned).level

  const categoryCounts: Record<string, number> = {}
  for (const c of completions) {
    const catId = c.task.categoryId
    categoryCounts[catId] = (categoryCounts[catId] ?? 0) + 1
  }

  return {
    totalTaskCount,
    categoryCounts,
    currentStreakDays: streakState.currentStreak,
    totalPointsEarned,
    currentLevel,
  }
}
```

Add the import at the top of `src/lib/achievements.ts`:

```typescript
import { getOrCreateStreakState } from '@/lib/streak'
```

- [ ] **Step 2: Refactor profile-stats.ts**

In `src/lib/profile-stats.ts`, replace the inline streak calculation with:

Add at the top:
```typescript
import { getOrCreateStreakState } from '@/lib/streak'
```

Replace the streak calculation block (lines 24-34, the `const daySet = new Set(...)` through `streak++; else break`) with:

```typescript
  const streakState = await getOrCreateStreakState(userId)
  const streak = streakState.currentStreak
```

Remove the now-unused variables `daySet`, `todayKey`, `startDay` etc. The `return` statement already uses `streak`, so it works as-is.

- [ ] **Step 3: Refactor stats route**

In `src/app/api/stats/route.ts`, add at the top:
```typescript
import { getOrCreateStreakState } from '@/lib/streak'
```

Replace the streak calculation block (lines 34-47, `// Streak` section) with:

```typescript
    // Streak
    const streakState = await getOrCreateStreakState(session.user.id)
    const streak = streakState.currentStreak
```

Remove the now-unused `daySet` variable from the streak section (keep the `allTimeCompletions` query — it's still used for `totalEarned`).

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/achievements.ts src/lib/profile-stats.ts src/app/api/stats/route.ts
git commit -m "refactor: consolidate streak calculation to use streak library"
```

---

### Task 6: Streak API Endpoints

**Files:**
- Create: `src/app/api/streak/route.ts`
- Create: `src/app/api/streak/restore/route.ts`

- [ ] **Step 1: Create GET /api/streak endpoint**

Create `src/app/api/streak/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentPoints, getTotalEarned } from '@/lib/points'
import {
  getOrCreateStreakState,
  getStreakTier,
  getNextTier,
  isRestoreAvailable,
} from '@/lib/streak'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const state = await getOrCreateStreakState(userId)
  const tier = getStreakTier(state.currentStreak)
  const nextTier = getNextTier(state.currentStreak)
  const restoreInfo = await isRestoreAvailable(userId)

  // Points balance
  const [completions, purchases] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      select: { points: true, completedAt: true },
    }),
    prisma.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    }),
  ])
  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)

  // Heatmap
  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  return NextResponse.json({
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    restoreCount: state.restoreCount,
    lastActiveAt: state.lastActiveAt?.toISOString() ?? null,
    tier: { name: tier.name, percent: tier.percent },
    nextTier: nextTier
      ? { name: nextTier.tier.name, percent: nextTier.tier.percent, daysNeeded: nextTier.daysNeeded }
      : null,
    restore: {
      available: restoreInfo.available,
      price: restoreInfo.price,
    },
    balance,
    heatmap,
  })
}
```

- [ ] **Step 2: Create POST /api/streak/restore endpoint**

Create `src/app/api/streak/restore/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeRestore } from '@/lib/streak'

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await executeRestore(session.user.id)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/streak/route.ts src/app/api/streak/restore/route.ts
git commit -m "feat: add streak API endpoints (GET state, POST restore)"
```

---

### Task 7: Dashboard Streak Widget — Bonus Display, Restore Alert, Clickable

**Files:**
- Modify: `src/components/dashboard/stat-pills.tsx`
- Modify: `src/app/(app)/page.tsx`

- [ ] **Step 1: Extend StatPills component**

Replace the entire contents of `src/components/dashboard/stat-pills.tsx` with:

```typescript
import Link from 'next/link'
import { LEVELS } from '@/lib/points'

type StatPillsProps = {
  streakDays: number
  streakBonusPercent: number
  streakBonusName: string
  restoreAvailable: boolean
  restorePrice: number
  level: number
  levelTitle: string
  totalEarned: number
  balance: number
}

export function StatPills({
  streakDays,
  streakBonusPercent,
  streakBonusName,
  restoreAvailable,
  restorePrice,
  level,
  levelTitle,
  totalEarned,
  balance,
}: StatPillsProps) {
  const currentLevel = LEVELS.find((l) => l.level === level) ?? LEVELS[0]
  const nextLevel = LEVELS.find((l) => l.level === level + 1)
  const progressPercent = nextLevel
    ? Math.round(((totalEarned - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalEarned : 0

  return (
    <div className="space-y-2 mb-4">
      {restoreAvailable && (
        <Link href="/streak">
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center gap-3 hover:bg-amber-100 transition-colors cursor-pointer">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                Deine {streakDays}-Tage-Streak ist in Gefahr!
              </p>
              <p className="text-xs text-amber-600">
                Für {restorePrice} Punkte wiederherstellen
              </p>
            </div>
            <span className="text-amber-400 text-sm">›</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-[1fr_2fr_1fr] gap-3">
        {/* Streak — clickable */}
        <Link href="/streak">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-slate-800">{streakDays}</span>
            {streakBonusPercent > 0 ? (
              <span className="text-[10px] text-indigo-600 font-medium">+{streakBonusPercent}%</span>
            ) : (
              <span className="text-[10px] text-slate-500">Streak</span>
            )}
          </div>
        </Link>

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
    </div>
  )
}
```

- [ ] **Step 2: Update Dashboard page to pass new props**

In `src/app/(app)/page.tsx`, add at the top with the other imports:

```typescript
import { getOrCreateStreakState, getStreakTier, isRestoreAvailable } from '@/lib/streak'
```

Inside `DashboardPage`, after the existing `Promise.all` that fetches `stats`, `spent`, `users`, add:

```typescript
  const [streakState, restoreInfo] = await Promise.all([
    getOrCreateStreakState(userId),
    isRestoreAvailable(userId),
  ])
  const streakTier = getStreakTier(streakState.currentStreak)
```

Then update the `<StatPills>` component call. Replace:

```tsx
      <StatPills
        streakDays={stats.currentStreakDays}
        level={levelInfo.level}
        levelTitle={levelInfo.title}
        totalEarned={stats.totalPointsEarned}
        balance={balance}
      />
```

With:

```tsx
      <StatPills
        streakDays={streakState.currentStreak}
        streakBonusPercent={streakTier.percent}
        streakBonusName={streakTier.name}
        restoreAvailable={restoreInfo.available}
        restorePrice={restoreInfo.price}
        level={levelInfo.level}
        levelTitle={levelInfo.title}
        totalEarned={stats.totalPointsEarned}
        balance={balance}
      />
```

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/stat-pills.tsx src/app/(app)/page.tsx
git commit -m "feat: enhance dashboard streak widget with bonus display and restore alert"
```

---

### Task 8: Streak Detail Page

**Files:**
- Create: `src/app/(app)/streak/page.tsx`
- Create: `src/app/(app)/streak/streak-client.tsx`

- [ ] **Step 1: Create the streak detail page (server component)**

Create `src/app/(app)/streak/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentPoints, getTotalEarned } from '@/lib/points'
import {
  STREAK_TIERS,
  getOrCreateStreakState,
  getStreakTier,
  getNextTier,
  isRestoreAvailable,
  calculateRestorePrice,
} from '@/lib/streak'
import { StreakClient } from './streak-client'

export const dynamic = 'force-dynamic'

export default async function StreakPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const state = await getOrCreateStreakState(userId)
  const tier = getStreakTier(state.currentStreak)
  const nextTier = getNextTier(state.currentStreak)
  const restoreInfo = await isRestoreAvailable(userId)

  // Points balance for display
  const [completions, purchases] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      select: { points: true, completedAt: true },
    }),
    prisma.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    }),
  ])
  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)

  // Heatmap data
  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  const tiers = [...STREAK_TIERS].reverse()

  return (
    <StreakClient
      currentStreak={state.currentStreak}
      bestStreak={state.bestStreak}
      restoreCount={state.restoreCount}
      tierName={tier.name}
      tierPercent={tier.percent}
      nextTier={nextTier ? { name: nextTier.tier.name, percent: nextTier.tier.percent, daysNeeded: nextTier.daysNeeded } : null}
      restore={{ available: restoreInfo.available, price: restoreInfo.price }}
      balance={balance}
      tiers={tiers.map((t) => ({ minDays: t.minDays, percent: t.percent, name: t.name }))}
      heatmap={heatmap}
    />
  )
}
```

- [ ] **Step 2: Create the streak client component**

Create `src/app/(app)/streak/streak-client.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type StreakClientProps = {
  currentStreak: number
  bestStreak: number
  restoreCount: number
  tierName: string
  tierPercent: number
  nextTier: { name: string; percent: number; daysNeeded: number } | null
  restore: { available: boolean; price: number }
  balance: number
  tiers: { minDays: number; percent: number; name: string }[]
  heatmap: Record<string, number>
}

export function StreakClient({
  currentStreak,
  bestStreak,
  restoreCount,
  tierName,
  tierPercent,
  nextTier,
  restore,
  balance,
  tiers,
  heatmap,
}: StreakClientProps) {
  const router = useRouter()
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  async function handleRestore() {
    setRestoring(true)
    setRestoreError(null)
    try {
      const res = await fetch('/api/streak/restore', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setRestoreError(data.error ?? 'Fehler bei der Wiederherstellung')
        return
      }
      router.refresh()
    } catch {
      setRestoreError('Netzwerkfehler')
    } finally {
      setRestoring(false)
    }
  }

  // Generate heatmap for last 12 weeks
  const today = new Date()
  const weeks: { date: string; value: number }[][] = []
  for (let w = 11; w >= 0; w--) {
    const week: { date: string; value: number }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setUTCDate(date.getUTCDate() - (w * 7 + (6 - d)))
      const key = date.toISOString().slice(0, 10)
      week.push({ date: key, value: heatmap[key] ?? 0 })
    }
    weeks.push(week)
  }

  function heatColor(value: number): string {
    if (value === 0) return 'bg-slate-100'
    if (value < 20) return 'bg-indigo-200'
    if (value < 50) return 'bg-indigo-300'
    if (value < 100) return 'bg-indigo-400'
    return 'bg-indigo-500'
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/" className="text-sm text-indigo-500 hover:text-indigo-700">
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <span className="text-5xl">🔥</span>
        <p className="text-4xl font-bold text-slate-800 mt-2">{currentStreak} Tage</p>
        {tierPercent > 0 ? (
          <p className="text-indigo-600 font-medium mt-1">{tierName} · +{tierPercent}% Bonus</p>
        ) : (
          <p className="text-slate-500 mt-1">Noch kein Bonus aktiv</p>
        )}
      </div>

      {/* Restore Alert */}
      {restore.available && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Deine Streak ist in Gefahr!
          </p>
          <p className="text-xs text-amber-600 mb-3">
            Du hast gestern keine Aufgabe erledigt. Stelle deine {currentStreak}-Tage-Streak
            f\u00fcr {restore.price} Punkte wieder her. Du musst danach heute noch eine Aufgabe
            erledigen, um die Streak fortzuf\u00fchren.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestore}
              disabled={restoring || balance < restore.price}
              className="bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {restoring ? 'Wird wiederhergestellt...' : `Wiederherstellen (${restore.price} Pkt)`}
            </button>
            <span className="text-xs text-amber-600">
              Guthaben: {balance} Punkte
            </span>
          </div>
          {balance < restore.price && (
            <p className="text-xs text-red-600 mt-2">Nicht genug Punkte!</p>
          )}
          {restoreError && (
            <p className="text-xs text-red-600 mt-2">{restoreError}</p>
          )}
        </div>
      )}

      {/* Next Tier Progress */}
      {nextTier && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-800">N\u00e4chste Stufe</span>
            <span className="text-xs text-indigo-600 font-medium">{nextTier.name} (+{nextTier.percent}%)</span>
          </div>
          <div className="bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all"
              style={{
                width: `${Math.round(
                  ((currentStreak - (tiers.find((t) => t.percent < nextTier.percent && t.minDays <= currentStreak)?.minDays ?? 0)) /
                    (nextTier.daysNeeded + currentStreak - (tiers.find((t) => t.percent < nextTier.percent && t.minDays <= currentStreak)?.minDays ?? 0))) *
                    100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Noch {nextTier.daysNeeded} {nextTier.daysNeeded === 1 ? 'Tag' : 'Tage'}
          </p>
        </div>
      )}

      {/* Bonus Tiers Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Bonus-Stufen</h2>
        <div className="space-y-2">
          {tiers.map((t) => {
            const isActive = t.name === tierName
            return (
              <div
                key={t.minDays}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'
                }`}
              >
                <span>
                  {isActive && '► '}{t.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">ab {t.minDays} Tage</span>
                  <span className={`font-medium ${isActive ? 'text-indigo-600' : ''}`}>
                    +{t.percent}%
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak History */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Streak-Historie</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{bestStreak}</p>
            <p className="text-xs text-slate-500">Beste Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{restoreCount}</p>
            <p className="text-xs text-slate-500">Wiederherstellungen</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Aktivit\u00e4t (12 Wochen)</h2>
        <div className="flex gap-1 justify-center">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${heatColor(day.value)}`}
                  title={`${day.date}: ${day.value} Punkte`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">So funktioniert die Streak</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Erledige jeden Tag mindestens eine Aufgabe, um deine Streak zu halten.
          Bei aktiver Streak erh\u00e4ltst du Bonus-Punkte auf jede erledigte Aufgabe.
          Je l\u00e4nger deine Streak, desto h\u00f6her der Bonus! Falls du einen Tag verpasst,
          kannst du deine Streak am Folgetag gegen Punkte wiederherstellen — aber du musst
          danach trotzdem noch eine Aufgabe am selben Tag erledigen.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/streak/page.tsx src/app/(app)/streak/streak-client.tsx
git commit -m "feat: add streak detail page with restore, tiers, history, and heatmap"
```

---

### Task 9: Docker Entrypoint — Seed StreakState Table

**Files:**
- Modify: `scripts/docker-entrypoint.sh`

- [ ] **Step 1: Add StreakState seed to entrypoint**

In `scripts/docker-entrypoint.sh`, inside the large `DB_PATH="$DB_PATH" node -e "..."` seed block, add the following lines right before `db.close();`:

```javascript
    // Ensure StreakState exists for both users
    const insertStreak = db.prepare('INSERT OR IGNORE INTO StreakState (id, userId, currentStreak, bestStreak, restoreCount, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
    insertStreak.run('streak-1', 'user-1', 0, 0, 0, now);
    insertStreak.run('streak-2', 'user-2', 0, 0, 0, now);
```

Update the final console.log to include StreakState:
```javascript
    console.log('Stammdaten geprüft: 2 User, 5 Kategorien, 16 Tasks, 5 Belohnungen, 13 Achievements, 2 StreakStates');
```

- [ ] **Step 2: Commit**

```bash
git add scripts/docker-entrypoint.sh
git commit -m "feat: add StreakState seed to Docker entrypoint"
```

---

### Task 10: Final Integration — Run Full Test Suite & Verify Build

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Verify production build**

Run: `npm run build`
Expected: Build succeeds. The `/streak` page is listed in the output.

- [ ] **Step 3: Verify lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 4: Final commit (if any fixes were needed)**

Only if steps 1-3 required fixes:
```bash
git add -A
git commit -m "fix: resolve build/test issues from streak integration"
```
