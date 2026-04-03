# Settings-Seite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine dedizierte Settings-Seite mit 8 Tabs, die `/admin` ersetzt und alle konfigurierbaren Parameter der App zentral zugänglich macht.

**Architecture:** Neues `AppConfig` Key-Value-Model für einfache Parameter (Streak-Tiers, Level-Definitionen, Boni). Bestehende Models (Category, Achievement) werden CRUD-fähig. Lib-Funktionen bleiben synchron, akzeptieren aber optionale Config-Parameter — Aufrufer laden Config aus der DB und übergeben sie. So bleiben die Funktionen pure und testbar.

**Tech Stack:** Next.js, Prisma (SQLite), TypeScript, Tailwind CSS, Vitest.

**Design-Spec:** `docs/superpowers/specs/2026-04-03-settings-page-design.md`

---

### Task 1: Prisma Schema — AppConfig Model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add AppConfig model to schema**

Add at the end of `prisma/schema.prisma`:

```prisma
model AppConfig {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Generate migration**

Run: `npx prisma migrate dev --name add_app_config`
Expected: Migration created successfully, Prisma client regenerated.

- [ ] **Step 3: Verify by running existing tests**

Run: `npx vitest run`
Expected: All existing tests still pass (no model changes, only addition).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add AppConfig model for configurable settings"
```

---

### Task 2: Config Library

**Files:**
- Create: `src/lib/config.ts`
- Create: `src/tests/lib/config.test.ts`

- [ ] **Step 1: Write tests for config library**

Create `src/tests/lib/config.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  DEFAULT_STREAK_TIERS,
  DEFAULT_TEAMWORK_BONUS_PERCENT,
  DEFAULT_RESTORE_BASE_PRICE,
  DEFAULT_RESTORE_PER_DAY_PRICE,
  DEFAULT_LEVEL_DEFINITIONS,
  DEFAULT_RECURRING_INTERVALS,
} from '@/lib/config'

describe('config defaults', () => {
  it('has 5 streak tiers sorted by minDays descending', () => {
    expect(DEFAULT_STREAK_TIERS).toHaveLength(5)
    expect(DEFAULT_STREAK_TIERS[0].minDays).toBe(30)
    expect(DEFAULT_STREAK_TIERS[4].minDays).toBe(0)
  })

  it('has teamwork bonus of 10', () => {
    expect(DEFAULT_TEAMWORK_BONUS_PERCENT).toBe(10)
  })

  it('has restore base price of 20 and per-day of 5', () => {
    expect(DEFAULT_RESTORE_BASE_PRICE).toBe(20)
    expect(DEFAULT_RESTORE_PER_DAY_PRICE).toBe(5)
  })

  it('has 6 level definitions starting at 0', () => {
    expect(DEFAULT_LEVEL_DEFINITIONS).toHaveLength(6)
    expect(DEFAULT_LEVEL_DEFINITIONS[0].minPoints).toBe(0)
    expect(DEFAULT_LEVEL_DEFINITIONS[5].minPoints).toBe(4000)
  })

  it('has 3 recurring intervals', () => {
    expect(DEFAULT_RECURRING_INTERVALS).toEqual({ daily: 1, weekly: 7, monthly: 30 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/lib/config.test.ts`
Expected: FAIL — module `@/lib/config` not found.

- [ ] **Step 3: Implement config library**

Create `src/lib/config.ts`:

```typescript
import { prisma } from '@/lib/prisma'

// --- Default constants (match current hardcoded values) ---

export type StreakTierDef = { minDays: number; percent: number; name: string }
export type LevelDef = { level: number; minPoints: number; title: string }

export const DEFAULT_STREAK_TIERS: StreakTierDef[] = [
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 7,  percent: 10, name: 'Feuer-Starter' },
  { minDays: 3,  percent: 5,  name: 'Warm-up' },
  { minDays: 0,  percent: 0,  name: 'Kein Bonus' },
]

export const DEFAULT_TEAMWORK_BONUS_PERCENT = 10
export const DEFAULT_RESTORE_BASE_PRICE = 20
export const DEFAULT_RESTORE_PER_DAY_PRICE = 5

export const DEFAULT_LEVEL_DEFINITIONS: LevelDef[] = [
  { level: 1, minPoints: 0,    title: 'Haushaltslehrling' },
  { level: 2, minPoints: 200,  title: 'Ordnungs-Fan' },
  { level: 3, minPoints: 500,  title: 'Putz-Profi' },
  { level: 4, minPoints: 1000, title: 'Haushalts-Held' },
  { level: 5, minPoints: 2000, title: 'Hygiene-Legende' },
  { level: 6, minPoints: 4000, title: 'Wohn-Meister' },
]

export const DEFAULT_RECURRING_INTERVALS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
}

// --- Config CRUD ---

export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  const row = await prisma.appConfig.findUnique({ where: { key } })
  if (!row) return defaultValue
  try {
    return JSON.parse(row.value) as T
  } catch {
    return defaultValue
  }
}

export async function setConfig<T>(key: string, value: T): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  })
}

// --- Bulk loader for server-side use ---

export type GameConfig = {
  streakTiers: StreakTierDef[]
  teamworkBonusPercent: number
  restoreBasePrice: number
  restorePerDayPrice: number
  levelDefinitions: LevelDef[]
  recurringIntervals: Record<string, number>
}

export async function loadGameConfig(): Promise<GameConfig> {
  const [streakTiers, teamworkBonusPercent, restoreBasePrice, restorePerDayPrice, levelDefinitions, recurringIntervals] =
    await Promise.all([
      getConfig('streak_tiers', DEFAULT_STREAK_TIERS),
      getConfig('teamwork_bonus_percent', DEFAULT_TEAMWORK_BONUS_PERCENT),
      getConfig('restore_base_price', DEFAULT_RESTORE_BASE_PRICE),
      getConfig('restore_per_day_price', DEFAULT_RESTORE_PER_DAY_PRICE),
      getConfig('level_definitions', DEFAULT_LEVEL_DEFINITIONS),
      getConfig('recurring_intervals', DEFAULT_RECURRING_INTERVALS),
    ])
  return { streakTiers, teamworkBonusPercent, restoreBasePrice, restorePerDayPrice, levelDefinitions, recurringIntervals }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/lib/config.test.ts`
Expected: PASS — all 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/config.ts src/tests/lib/config.test.ts
git commit -m "feat: add config library with defaults and DB-backed getConfig/setConfig"
```

---

### Task 3: Refactor streak.ts — Optional Config Parameters

**Files:**
- Modify: `src/lib/streak.ts`
- Modify: `src/tests/lib/streak.test.ts`

The key change: functions stay **synchronous** but accept optional config parameters. When omitted, they use the defaults from `config.ts`. This keeps them pure and testable.

- [ ] **Step 1: Update streak.ts imports and remove old constants**

In `src/lib/streak.ts`, replace lines 1-11:

```typescript
import { prisma } from '@/lib/prisma'
import {
  DEFAULT_STREAK_TIERS,
  DEFAULT_TEAMWORK_BONUS_PERCENT,
  DEFAULT_RESTORE_BASE_PRICE,
  DEFAULT_RESTORE_PER_DAY_PRICE,
  type StreakTierDef,
} from '@/lib/config'
```

Remove the old `STREAK_TIERS`, `TEAMWORK_BONUS_PERCENT` constants and `StreakTier` type.

- [ ] **Step 2: Update getStreakTier to accept optional tiers**

Replace the `getStreakTier` function:

```typescript
export function getStreakTier(currentStreak: number, tiers?: StreakTierDef[]): StreakTierDef {
  const t = tiers ?? DEFAULT_STREAK_TIERS
  return t.find((tier) => currentStreak >= tier.minDays) ?? t[t.length - 1]
}
```

- [ ] **Step 3: Update applyBonus to accept optional config**

Replace the `applyBonus` function:

```typescript
export function applyBonus(
  basePoints: number,
  currentStreak: number,
  isShared: boolean = false,
  opts?: { tiers?: StreakTierDef[]; teamworkPercent?: number }
): number {
  const tier = getStreakTier(currentStreak, opts?.tiers)
  const teamwork = opts?.teamworkPercent ?? DEFAULT_TEAMWORK_BONUS_PERCENT
  const totalPercent = tier.percent + (isShared ? teamwork : 0)
  return Math.floor(basePoints * (1 + totalPercent / 100))
}
```

- [ ] **Step 4: Update calculateRestorePrice to accept optional config**

Replace the `calculateRestorePrice` function:

```typescript
export function calculateRestorePrice(
  currentStreak: number,
  opts?: { basePrice?: number; perDayPrice?: number }
): number {
  const base = opts?.basePrice ?? DEFAULT_RESTORE_BASE_PRICE
  const perDay = opts?.perDayPrice ?? DEFAULT_RESTORE_PER_DAY_PRICE
  return base + perDay * currentStreak
}
```

- [ ] **Step 5: Update getNextTier to accept optional tiers**

Replace the `getNextTier` function:

```typescript
export function getNextTier(currentStreak: number, tiers?: StreakTierDef[]): { tier: StreakTierDef; daysNeeded: number } | null {
  const t = tiers ?? DEFAULT_STREAK_TIERS
  const nextTier = [...t].reverse().find((tier) => tier.minDays > currentStreak)
  if (!nextTier) return null
  return { tier: nextTier, daysNeeded: nextTier.minDays - currentStreak }
}
```

- [ ] **Step 6: Update updateStreakOnCompletion to use getStreakTier with optional tiers**

In the `updateStreakOnCompletion` function, update the return statement (line ~132) to accept optional tiers:

```typescript
export async function updateStreakOnCompletion(
  userId: string,
  tiers?: StreakTierDef[]
): Promise<{ currentStreak: number; bonusPercent: number }> {
```

And update the return line:

```typescript
  return { currentStreak: newStreak, bonusPercent: getStreakTier(newStreak, tiers).percent }
```

- [ ] **Step 7: Update test imports**

In `src/tests/lib/streak.test.ts`, update the imports (lines 1-8):

```typescript
import { describe, it, expect } from 'vitest'
import {
  getStreakTier,
  applyBonus,
  calculateRestorePrice,
  getNextTier,
} from '@/lib/streak'
import { DEFAULT_STREAK_TIERS } from '@/lib/config'
```

Update any test that referenced `STREAK_TIERS` directly to use `DEFAULT_STREAK_TIERS`. Currently no tests reference `STREAK_TIERS` directly except through the imported functions, so just the import change is needed.

- [ ] **Step 8: Run tests**

Run: `npx vitest run src/tests/lib/streak.test.ts`
Expected: All 32 tests pass — functions default to same values, signatures are backward-compatible.

- [ ] **Step 9: Commit**

```bash
git add src/lib/streak.ts src/tests/lib/streak.test.ts
git commit -m "refactor: streak functions accept optional config params from config.ts"
```

---

### Task 4: Refactor points.ts and recurring.ts — Optional Config Parameters

**Files:**
- Modify: `src/lib/points.ts`
- Modify: `src/lib/recurring.ts`
- Modify: `src/tests/lib/points.test.ts` (if needed)
- Modify: `src/tests/lib/recurring.test.ts` (if needed)

- [ ] **Step 1: Update points.ts**

Replace `src/lib/points.ts` entirely:

```typescript
import { DEFAULT_LEVEL_DEFINITIONS, type LevelDef } from '@/lib/config'

export function getCurrentPoints(earned: number, spent: number): number {
  return Math.max(0, earned - spent)
}

export function getTotalEarned(completions: { points: number }[]): number {
  return completions.reduce((sum, c) => sum + c.points, 0)
}

export function getLevel(
  totalEarned: number,
  levels?: LevelDef[]
): { level: number; title: string; minPoints: number } {
  const l = levels ?? DEFAULT_LEVEL_DEFINITIONS
  const current = [...l].reverse().find((lv) => totalEarned >= lv.minPoints)
  return current ?? l[0]
}
```

- [ ] **Step 2: Update recurring.ts**

Replace `src/lib/recurring.ts` entirely:

```typescript
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
```

- [ ] **Step 3: Update test imports if needed**

In `src/tests/lib/points.test.ts`, update imports to use `DEFAULT_LEVEL_DEFINITIONS` from config instead of `LEVELS` from points:

```typescript
import { getCurrentPoints, getTotalEarned, getLevel } from '@/lib/points'
import { DEFAULT_LEVEL_DEFINITIONS } from '@/lib/config'
```

Replace any `LEVELS` reference with `DEFAULT_LEVEL_DEFINITIONS`.

In `src/tests/lib/recurring.test.ts`, no changes needed — tests call `getNextDueAt` without custom intervals, so the default kicks in.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/points.ts src/lib/recurring.ts src/tests/lib/points.test.ts src/tests/lib/recurring.test.ts
git commit -m "refactor: points and recurring functions accept optional config params"
```

---

### Task 5: Update Callers to Load and Pass Config

**Files:**
- Modify: `src/app/api/tasks/[id]/complete/route.ts`
- Modify: `src/app/(app)/page.tsx`
- Modify: `src/app/(app)/streak/page.tsx`
- Modify: `src/app/api/streak/route.ts`
- Modify: `src/lib/streak.ts` (isRestoreAvailable, executeRestore)
- Modify: `src/lib/achievements.ts`
- Modify: `src/lib/profile-stats.ts`
- Modify: `src/app/api/stats/route.ts`
- Modify: `src/components/dashboard/stat-pills.tsx`
- Modify: `src/components/dashboard/points-header.tsx`

These changes are mechanical: load config from DB at the top of each server-side function/page, then pass to pure functions.

- [ ] **Step 1: Update complete/route.ts**

In `src/app/api/tasks/[id]/complete/route.ts`, add import at top:

```typescript
import { loadGameConfig } from '@/lib/config'
```

At the start of the POST handler (after session check), add:

```typescript
  const config = await loadGameConfig()
```

Update the two `applyBonus` calls:

```typescript
  const pointsWithBonus = applyBonus(task.points, currentStreak, isShared, {
    tiers: config.streakTiers,
    teamworkPercent: config.teamworkBonusPercent,
  })
```

```typescript
    const partnerPoints = applyBonus(task.points, partnerStreak, true, {
      tiers: config.streakTiers,
      teamworkPercent: config.teamworkBonusPercent,
    })
```

Update `getNextDueAt` calls to pass intervals:

```typescript
        const nextDueAt = getNextDueAt(task.recurringInterval, new Date(), config.recurringIntervals)
```

```typescript
    const nextDueAt = getNextDueAt(task.recurringInterval, new Date(), config.recurringIntervals)
```

Update `updateStreakOnCompletion` calls to pass tiers:

```typescript
  const { currentStreak } = await updateStreakOnCompletion(userId, config.streakTiers)
```

```typescript
    const { currentStreak: partnerStreak } = await updateStreakOnCompletion(withUserId, config.streakTiers)
```

- [ ] **Step 2: Update dashboard page.tsx**

In `src/app/(app)/page.tsx`, add import:

```typescript
import { loadGameConfig } from '@/lib/config'
```

In the `DashboardPage` function, load config early:

```typescript
  const config = await loadGameConfig()
```

Update calls:

```typescript
  const streakTier = getStreakTier(streakState.currentStreak, config.streakTiers)
```

```typescript
  const levelInfo = getLevel(stats.totalPointsEarned, config.levelDefinitions)
```

```typescript
  const partnerLevel = partner ? getLevel(getTotalEarned(partner.completions), config.levelDefinitions) : null
```

Pass level definitions to StatPills:

```typescript
      <StatPills
        ...existing props...
        levelDefinitions={config.levelDefinitions}
      />
```

- [ ] **Step 3: Update StatPills to accept level definitions as prop**

In `src/components/dashboard/stat-pills.tsx`, replace the `LEVELS` import:

```typescript
import { type LevelDef } from '@/lib/config'
```

Add to `StatPillsProps`:

```typescript
  levelDefinitions: LevelDef[]
```

Replace the `LEVELS` usage in the component:

```typescript
  const currentLevel = levelDefinitions.find((l) => l.level === level) ?? levelDefinitions[0]
  const nextLevel = levelDefinitions.find((l) => l.level === level + 1)
```

- [ ] **Step 4: Update streak/page.tsx**

In `src/app/(app)/streak/page.tsx`, replace imports:

```typescript
import { loadGameConfig } from '@/lib/config'
import {
  getOrCreateStreakState,
  getStreakTier,
  getNextTier,
  isRestoreAvailable,
} from '@/lib/streak'
```

Load config:

```typescript
  const config = await loadGameConfig()
```

Update calls:

```typescript
  const tier = getStreakTier(state.currentStreak, config.streakTiers)
  const nextTier = getNextTier(state.currentStreak, config.streakTiers)
```

Replace tiers prop construction:

```typescript
  const tiers = [...config.streakTiers].reverse()
```

- [ ] **Step 5: Update streak/route.ts**

In `src/app/api/streak/route.ts`, add import:

```typescript
import { loadGameConfig } from '@/lib/config'
```

Load config after session check:

```typescript
  const config = await loadGameConfig()
```

Update calls:

```typescript
  const tier = getStreakTier(state.currentStreak, config.streakTiers)
  const nextTier = getNextTier(state.currentStreak, config.streakTiers)
```

- [ ] **Step 6: Update isRestoreAvailable and executeRestore in streak.ts**

In `src/lib/streak.ts`, update `isRestoreAvailable` to accept optional config:

```typescript
export async function isRestoreAvailable(
  userId: string,
  opts?: { basePrice?: number; perDayPrice?: number }
): Promise<{ available: boolean; price: number; currentStreak: number }> {
```

Update the price calculation inside:

```typescript
  const price = calculateRestorePrice(state.currentStreak, opts)
```

Update `executeRestore` similarly:

```typescript
export async function executeRestore(
  userId: string,
  opts?: { basePrice?: number; perDayPrice?: number }
): Promise<{ success: boolean; error?: string }> {
```

Pass opts to `isRestoreAvailable`:

```typescript
  const restoreInfo = await isRestoreAvailable(userId, opts)
```

- [ ] **Step 7: Update callers of isRestoreAvailable**

In `src/app/(app)/page.tsx`:

```typescript
  const [streakState, restoreInfo] = await Promise.all([
    getOrCreateStreakState(userId),
    isRestoreAvailable(userId, { basePrice: config.restoreBasePrice, perDayPrice: config.restorePerDayPrice }),
  ])
```

In `src/app/(app)/streak/page.tsx`:

```typescript
  const restoreInfo = await isRestoreAvailable(userId, {
    basePrice: config.restoreBasePrice,
    perDayPrice: config.restorePerDayPrice,
  })
```

In `src/app/api/streak/route.ts`:

```typescript
  const restoreInfo = await isRestoreAvailable(userId, {
    basePrice: config.restoreBasePrice,
    perDayPrice: config.restorePerDayPrice,
  })
```

In `src/app/api/streak/restore/route.ts`, add:

```typescript
import { loadGameConfig } from '@/lib/config'
```

```typescript
  const config = await loadGameConfig()
  const result = await executeRestore(session.user.id, {
    basePrice: config.restoreBasePrice,
    perDayPrice: config.restorePerDayPrice,
  })
```

- [ ] **Step 8: Update achievements.ts and profile-stats.ts**

In `src/lib/achievements.ts`, update to accept optional levels:

```typescript
import { getTotalEarned, getLevel } from '@/lib/points'
import { type LevelDef } from '@/lib/config'
```

Update `computeStats`:

```typescript
export async function computeStats(userId: string, levels?: LevelDef[]): Promise<AchievementStats> {
```

```typescript
  const currentLevel = getLevel(totalPointsEarned, levels).level
```

Update `checkAndUnlockAchievements`:

```typescript
export async function checkAndUnlockAchievements(userId: string, levels?: LevelDef[]): Promise<string[]> {
  const stats = await computeStats(userId, levels)
```

In `src/lib/profile-stats.ts`:

```typescript
import { type LevelDef } from '@/lib/config'
```

```typescript
export async function computeProfileStats(userId: string, levels?: LevelDef[]) {
```

```typescript
  const level = getLevel(totalEarned, levels)
```

- [ ] **Step 9: Update callers of achievements and profile-stats**

In `src/app/(app)/page.tsx`, pass levels to `computeStats`:

```typescript
  const [stats, spent, users] = await Promise.all([
    computeStats(userId, config.levelDefinitions),
```

In `src/app/api/tasks/[id]/complete/route.ts`, pass levels to `checkAndUnlockAchievements`:

```typescript
    const newAchievementIds = await checkAndUnlockAchievements(userId, config.levelDefinitions)
```

```typescript
      await checkAndUnlockAchievements(withUserId, config.levelDefinitions)
```

In `src/app/(app)/profile/page.tsx`, add:

```typescript
import { loadGameConfig } from '@/lib/config'
```

```typescript
  const config = await loadGameConfig()
  const stats = await computeProfileStats(userId, config.levelDefinitions)
```

- [ ] **Step 10: Update points-header.tsx and stats/route.ts**

In `src/components/dashboard/points-header.tsx`, accept levels as prop:

```typescript
import { type LevelDef } from '@/lib/config'

type UserStat = { id: string; name: string; earned: number; spent: number }

export function PointsHeader({ users, levels }: { users: UserStat[]; levels?: LevelDef[] }) {
```

```typescript
        const { title } = getLevel(u.earned, levels)
```

In `src/app/api/stats/route.ts`, add:

```typescript
import { loadGameConfig } from '@/lib/config'
```

```typescript
  const config = await loadGameConfig()
```

Update `getLevel` calls:

```typescript
    return NextResponse.json({
      ...
      level: getLevel(totalEarned, config.levelDefinitions),
```

```

- [ ] **Step 11: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: all lib callers load config from DB and pass to pure functions"
```

---

### Task 6: Settings API — AppConfig GET/PUT and User Name PATCH

**Files:**
- Create: `src/app/api/settings/config/route.ts`
- Create: `src/app/api/settings/users/[id]/route.ts`

- [ ] **Step 1: Create config API endpoint**

Create `src/app/api/settings/config/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  DEFAULT_STREAK_TIERS,
  DEFAULT_TEAMWORK_BONUS_PERCENT,
  DEFAULT_RESTORE_BASE_PRICE,
  DEFAULT_RESTORE_PER_DAY_PRICE,
  DEFAULT_LEVEL_DEFINITIONS,
  DEFAULT_RECURRING_INTERVALS,
  getConfig,
} from '@/lib/config'

const CONFIG_DEFAULTS: Record<string, unknown> = {
  streak_tiers: DEFAULT_STREAK_TIERS,
  teamwork_bonus_percent: DEFAULT_TEAMWORK_BONUS_PERCENT,
  restore_base_price: DEFAULT_RESTORE_BASE_PRICE,
  restore_per_day_price: DEFAULT_RESTORE_PER_DAY_PRICE,
  level_definitions: DEFAULT_LEVEL_DEFINITIONS,
  recurring_intervals: DEFAULT_RECURRING_INTERVALS,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result: Record<string, unknown> = {}
  for (const [key, defaultValue] of Object.entries(CONFIG_DEFAULTS)) {
    result[key] = await getConfig(key, defaultValue)
  }
  return NextResponse.json(result)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { entries } = body as { entries: { key: string; value: unknown }[] }

  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: 'entries must be an array' }, { status: 400 })
  }

  const validKeys = new Set(Object.keys(CONFIG_DEFAULTS))
  for (const entry of entries) {
    if (!validKeys.has(entry.key)) {
      return NextResponse.json({ error: `Unknown config key: ${entry.key}` }, { status: 400 })
    }
  }

  for (const entry of entries) {
    await prisma.appConfig.upsert({
      where: { key: entry.key },
      update: { value: JSON.stringify(entry.value) },
      create: { key: entry.key, value: JSON.stringify(entry.value) },
    })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create user name PATCH endpoint**

Create `src/app/api/settings/users/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name } = body as { name: string }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { name: name.trim() },
  })

  return NextResponse.json({ id: updated.id, name: updated.name })
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/settings/
git commit -m "feat: add settings API for config GET/PUT and user name PATCH"
```

---

### Task 7: Settings API — Categories CRUD

**Files:**
- Create: `src/app/api/settings/categories/route.ts`
- Create: `src/app/api/settings/categories/[id]/route.ts`

- [ ] **Step 1: Create categories list and create endpoint**

Create `src/app/api/settings/categories/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.category.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      taskCount: c._count.tasks,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, emoji } = body as { name: string; emoji: string }

  if (!name || !emoji) {
    return NextResponse.json({ error: 'Name und Emoji sind Pflichtfelder' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), emoji: emoji.trim() },
  })

  return NextResponse.json(category, { status: 201 })
}
```

- [ ] **Step 2: Create category edit and delete endpoint**

Create `src/app/api/settings/categories/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, emoji } = body as { name?: string; emoji?: string }

  const category = await prisma.category.findUnique({ where: { id: params.id } })
  if (!category) {
    return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(emoji !== undefined ? { emoji: emoji.trim() } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const taskCount = await prisma.task.count({ where: { categoryId: params.id } })
  if (taskCount > 0) {
    return NextResponse.json(
      { error: `Kategorie hat noch ${taskCount} zugeordnete Tasks. Erst Tasks umziehen oder archivieren.` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/categories/
git commit -m "feat: add categories CRUD API for settings"
```

---

### Task 8: Settings API — Achievements CRUD

**Files:**
- Create: `src/app/api/settings/achievements/route.ts`
- Create: `src/app/api/settings/achievements/[id]/route.ts`

- [ ] **Step 1: Create achievements list and create endpoint**

Create `src/app/api/settings/achievements/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const achievements = await prisma.achievement.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(achievements)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, emoji, conditionType, conditionValue, conditionMeta, sortOrder } = body as {
    title: string
    description: string
    emoji: string
    conditionType: string
    conditionValue: number
    conditionMeta?: string
    sortOrder?: number
  }

  if (!title || !description || !emoji || !conditionType || conditionValue == null) {
    return NextResponse.json({ error: 'Pflichtfelder: title, description, emoji, conditionType, conditionValue' }, { status: 400 })
  }

  const validTypes = ['task_count', 'category_count', 'streak_days', 'total_points', 'level']
  if (!validTypes.includes(conditionType)) {
    return NextResponse.json({ error: `conditionType muss einer von: ${validTypes.join(', ')}` }, { status: 400 })
  }

  const achievement = await prisma.achievement.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      emoji: emoji.trim(),
      conditionType,
      conditionValue: Number(conditionValue),
      conditionMeta: conditionMeta?.trim() || null,
      sortOrder: sortOrder ?? 0,
    },
  })

  return NextResponse.json(achievement, { status: 201 })
}
```

- [ ] **Step 2: Create achievement edit and delete endpoint**

Create `src/app/api/settings/achievements/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const achievement = await prisma.achievement.findUnique({ where: { id: params.id } })
  if (!achievement) {
    return NextResponse.json({ error: 'Achievement nicht gefunden' }, { status: 404 })
  }

  const body = await req.json()
  const { title, description, emoji, conditionType, conditionValue, conditionMeta, sortOrder } = body as {
    title?: string
    description?: string
    emoji?: string
    conditionType?: string
    conditionValue?: number
    conditionMeta?: string | null
    sortOrder?: number
  }

  if (conditionType) {
    const validTypes = ['task_count', 'category_count', 'streak_days', 'total_points', 'level']
    if (!validTypes.includes(conditionType)) {
      return NextResponse.json({ error: `conditionType muss einer von: ${validTypes.join(', ')}` }, { status: 400 })
    }
  }

  const updated = await prisma.achievement.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(emoji !== undefined ? { emoji: emoji.trim() } : {}),
      ...(conditionType !== undefined ? { conditionType } : {}),
      ...(conditionValue !== undefined ? { conditionValue: Number(conditionValue) } : {}),
      ...(conditionMeta !== undefined ? { conditionMeta: conditionMeta?.trim() || null } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const achievement = await prisma.achievement.findUnique({ where: { id: params.id } })
  if (!achievement) {
    return NextResponse.json({ error: 'Achievement nicht gefunden' }, { status: 404 })
  }

  // Delete cascades to UserAchievements via onDelete: Cascade in schema
  await prisma.achievement.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/achievements/
git commit -m "feat: add achievements CRUD API for settings"
```

---

### Task 9: Settings Page — Server Component and Client Shell

**Files:**
- Create: `src/app/(app)/settings/page.tsx`
- Create: `src/app/(app)/settings/settings-client.tsx`

- [ ] **Step 1: Create server component**

Create `src/app/(app)/settings/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [config, users, categories, achievements, storeItems, tasks] = await Promise.all([
    loadGameConfig(),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.storeItem.findMany({ orderBy: { type: 'asc' } }),
    prisma.task.findMany({
      where: { status: { in: ['active', 'pending_approval'] } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <SettingsClient
      config={config}
      users={users}
      categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, taskCount: c._count.tasks }))}
      achievements={achievements}
      storeItems={storeItems}
      tasks={tasks}
      userId={session.user.id}
    />
  )
}
```

- [ ] **Step 2: Create client shell with tab navigation**

Create `src/app/(app)/settings/settings-client.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { type GameConfig } from '@/lib/config'
import { UsersTab } from './tabs/users-tab'
import { StreakTab } from './tabs/streak-tab'
import { LevelTab } from './tabs/level-tab'
import { BonusTab } from './tabs/bonus-tab'
import { CategoriesTab } from './tabs/categories-tab'
import { AchievementsTab } from './tabs/achievements-tab'
import { TasksTab } from './tabs/tasks-tab'
import { StoreTab } from './tabs/store-tab'

type Category = { id: string; name: string; emoji: string; taskCount: number }
type Achievement = {
  id: string; title: string; description: string; emoji: string
  conditionType: string; conditionValue: number; conditionMeta: string | null; sortOrder: number
}
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: { id: string; name: string; emoji: string } }

const TABS = [
  { key: 'users', label: 'Benutzer' },
  { key: 'streak', label: 'Streak' },
  { key: 'level', label: 'Level' },
  { key: 'bonus', label: 'Boni' },
  { key: 'categories', label: 'Kategorien' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'store', label: 'Store' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function SettingsClient({
  config, users, categories, achievements, storeItems, tasks, userId,
}: {
  config: GameConfig
  users: { id: string; name: string }[]
  categories: Category[]
  achievements: Achievement[]
  storeItems: StoreItem[]
  tasks: Task[]
  userId: string
}) {
  const [tab, setTab] = useState<TabKey>('users')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Einstellungen</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab users={users} />}
      {tab === 'streak' && <StreakTab config={config} />}
      {tab === 'level' && <LevelTab config={config} />}
      {tab === 'bonus' && <BonusTab config={config} />}
      {tab === 'categories' && <CategoriesTab categories={categories} />}
      {tab === 'achievements' && <AchievementsTab achievements={achievements} categories={categories} />}
      {tab === 'tasks' && <TasksTab tasks={tasks} categories={categories} userId={userId} />}
      {tab === 'store' && <StoreTab storeItems={storeItems} />}
    </div>
  )
}
```

- [ ] **Step 3: Create placeholder tab components**

Create `src/app/(app)/settings/tabs/` directory and 8 placeholder files. Each follows this pattern (example for `users-tab.tsx`):

Create `src/app/(app)/settings/tabs/users-tab.tsx`:

```typescript
'use client'

export function UsersTab({ users }: { users: { id: string; name: string }[] }) {
  return <div className="text-slate-400 text-sm">Benutzer-Tab wird implementiert...</div>
}
```

Create the same pattern for all 8:
- `users-tab.tsx` — props: `{ users }`
- `streak-tab.tsx` — props: `{ config: GameConfig }`
- `level-tab.tsx` — props: `{ config: GameConfig }`
- `bonus-tab.tsx` — props: `{ config: GameConfig }`
- `categories-tab.tsx` — props: `{ categories }`
- `achievements-tab.tsx` — props: `{ achievements, categories }`
- `tasks-tab.tsx` — props: `{ tasks, categories, userId }`
- `store-tab.tsx` — props: `{ storeItems }`

Each with the placeholder content pattern above, adjusted for its props and import of `GameConfig` where needed.

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(app\)/settings/
git commit -m "feat: add settings page skeleton with tab navigation and 8 placeholder tabs"
```

---

### Task 10: Settings Tabs — Benutzer, Streak, Level, Boni

**Files:**
- Modify: `src/app/(app)/settings/tabs/users-tab.tsx`
- Modify: `src/app/(app)/settings/tabs/streak-tab.tsx`
- Modify: `src/app/(app)/settings/tabs/level-tab.tsx`
- Modify: `src/app/(app)/settings/tabs/bonus-tab.tsx`

- [ ] **Step 1: Implement UsersTab**

Replace `src/app/(app)/settings/tabs/users-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UsersTab({ users }: { users: { id: string; name: string }[] }) {
  const router = useRouter()
  const [names, setNames] = useState<Record<string, string>>(
    Object.fromEntries(users.map((u) => [u.id, u.name]))
  )
  const [pins, setPins] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<Record<string, string>>({})

  async function saveName(uid: string) {
    const name = names[uid]?.trim()
    if (!name) return
    const res = await fetch(`/api/settings/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      setMsg((prev) => ({ ...prev, [uid]: 'Name gespeichert ✓' }))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg((prev) => ({ ...prev, [uid]: data.error ?? 'Fehler' }))
    }
  }

  async function changePin(uid: string) {
    const pin = pins[uid]
    if (!pin || pin.length < 4) {
      setMsg((prev) => ({ ...prev, [`pin-${uid}`]: 'Mindestens 4 Zeichen' }))
      return
    }
    const res = await fetch(`/api/users/${uid}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      setPins((prev) => ({ ...prev, [uid]: '' }))
      setMsg((prev) => ({ ...prev, [`pin-${uid}`]: 'PIN geändert ✓' }))
    } else {
      setMsg((prev) => ({ ...prev, [`pin-${uid}`]: 'Fehler' }))
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Namen und PINs für beide Benutzer verwalten.</p>
      {users.map((u) => (
        <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{u.name}</span>
            <span className="text-xs text-slate-400">{u.id}</span>
          </div>
          <div>
            <label className="text-xs text-slate-500">Name</label>
            <div className="flex gap-2">
              <Input
                value={names[u.id] ?? ''}
                onChange={(e) => setNames((prev) => ({ ...prev, [u.id]: e.target.value }))}
              />
              <Button onClick={() => saveName(u.id)} disabled={names[u.id]?.trim() === u.name}>
                Speichern
              </Button>
            </div>
            {msg[u.id] && <p className="text-xs text-slate-500 mt-1">{msg[u.id]}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500">Neue PIN</label>
            <div className="flex gap-2">
              <Input
                type="password"
                inputMode="numeric"
                placeholder="Min. 4 Zeichen"
                value={pins[u.id] ?? ''}
                onChange={(e) => setPins((prev) => ({ ...prev, [u.id]: e.target.value }))}
              />
              <Button onClick={() => changePin(u.id)} disabled={!pins[u.id]}>
                Ändern
              </Button>
            </div>
            {msg[`pin-${u.id}`] && <p className="text-xs text-slate-500 mt-1">{msg[`pin-${u.id}`]}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Implement StreakTab**

Replace `src/app/(app)/settings/tabs/streak-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig, type StreakTierDef } from '@/lib/config'

export function StreakTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const [tiers, setTiers] = useState<StreakTierDef[]>([...config.streakTiers])
  const [restoreBase, setRestoreBase] = useState(config.restoreBasePrice)
  const [restorePerDay, setRestorePerDay] = useState(config.restorePerDayPrice)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateTier(index: number, field: keyof StreakTierDef, value: string | number) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  function addTier() {
    setTiers((prev) => [...prev, { minDays: 0, percent: 0, name: '' }])
  }

  async function save() {
    setSaving(true)
    setMsg('')
    // Sort tiers by minDays descending before saving
    const sorted = [...tiers].sort((a, b) => b.minDays - a.minDays)
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [
          { key: 'streak_tiers', value: sorted },
          { key: 'restore_base_price', value: restoreBase },
          { key: 'restore_per_day_price', value: restorePerDay },
        ],
      }),
    })
    setSaving(false)
    if (res.ok) {
      setTiers(sorted)
      setMsg('Gespeichert ✓')
      router.refresh()
    } else {
      setMsg('Fehler beim Speichern')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-1">Streak-Tiers</h2>
        <p className="text-sm text-slate-500 mb-3">Bonus-Stufen basierend auf aufeinanderfolgenden Tagen. Werden automatisch nach Tagen absteigend sortiert.</p>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center flex-wrap">
              <label className="text-xs text-slate-500 w-12">Ab Tag</label>
              <Input
                type="number"
                className="w-16 text-center"
                value={tier.minDays}
                onChange={(e) => updateTier(i, 'minDays', Number(e.target.value))}
              />
              <label className="text-xs text-slate-500 w-12">Bonus</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  className="w-16 text-center"
                  value={tier.percent}
                  onChange={(e) => updateTier(i, 'percent', Number(e.target.value))}
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
              <label className="text-xs text-slate-500 w-10">Name</label>
              <Input
                className="flex-1 min-w-[100px]"
                value={tier.name}
                onChange={(e) => updateTier(i, 'name', e.target.value)}
              />
              <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addTier}>+ Tier hinzufügen</Button>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">Streak-Restore Preisformel</h2>
        <p className="text-sm text-slate-500 mb-3">Preis = Basis + (Pro-Tag × aktuelle Streak-Tage)</p>
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-slate-500">Basis-Preis</label>
            <Input type="number" className="w-24" value={restoreBase} onChange={(e) => setRestoreBase(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Pro Streak-Tag</label>
            <Input type="number" className="w-24" value={restorePerDay} onChange={(e) => setRestorePerDay(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {msg && <p className="text-sm text-slate-500">{msg}</p>}
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Implement LevelTab**

Replace `src/app/(app)/settings/tabs/level-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig, type LevelDef } from '@/lib/config'

export function LevelTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const [levels, setLevels] = useState<LevelDef[]>([...config.levelDefinitions])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateLevel(index: number, field: keyof LevelDef, value: string | number) {
    setLevels((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function removeLevel(index: number) {
    if (index === 0) return // Level 1 can't be removed
    setLevels((prev) => prev.filter((_, i) => i !== index))
  }

  function addLevel() {
    const nextNum = levels.length + 1
    const lastPoints = levels[levels.length - 1]?.minPoints ?? 0
    setLevels((prev) => [...prev, { level: nextNum, minPoints: lastPoints + 1000, title: '' }])
  }

  async function save() {
    setSaving(true)
    setMsg('')
    // Renumber levels and sort by minPoints
    const sorted = [...levels]
      .sort((a, b) => a.minPoints - b.minPoints)
      .map((l, i) => ({ ...l, level: i + 1 }))
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: [{ key: 'level_definitions', value: sorted }] }),
    })
    setSaving(false)
    if (res.ok) {
      setLevels(sorted)
      setMsg('Gespeichert ✓')
      router.refresh()
    } else {
      setMsg('Fehler beim Speichern')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Level-Definitionen mit Punkteschwellen. Level 1 beginnt immer bei 0 Punkten.</p>
      <div className="space-y-2">
        {levels.map((level, i) => (
          <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center flex-wrap">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">Lv.{level.level}</span>
            <Input
              className="flex-1 min-w-[120px]"
              placeholder="Titel"
              value={level.title}
              onChange={(e) => updateLevel(i, 'title', e.target.value)}
            />
            {i === 0 ? (
              <span className="text-xs text-slate-400">ab 0 Pkt</span>
            ) : (
              <>
                <label className="text-xs text-slate-500">ab</label>
                <Input
                  type="number"
                  className="w-20 text-center"
                  value={level.minPoints}
                  onChange={(e) => updateLevel(i, 'minPoints', Number(e.target.value))}
                />
                <span className="text-xs text-slate-400">Pkt</span>
                <button onClick={() => removeLevel(i)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
              </>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full" onClick={addLevel}>+ Level hinzufügen</Button>

      <div className="flex items-center justify-between">
        {msg && <p className="text-sm text-slate-500">{msg}</p>}
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement BonusTab**

Replace `src/app/(app)/settings/tabs/bonus-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig } from '@/lib/config'

type IntervalEntry = { name: string; days: number }

export function BonusTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const [teamworkPercent, setTeamworkPercent] = useState(config.teamworkBonusPercent)
  const [intervals, setIntervals] = useState<IntervalEntry[]>(
    Object.entries(config.recurringIntervals).map(([name, days]) => ({ name, days }))
  )
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateInterval(index: number, field: 'name' | 'days', value: string | number) {
    setIntervals((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function removeInterval(index: number) {
    setIntervals((prev) => prev.filter((_, i) => i !== index))
  }

  function addInterval() {
    setIntervals((prev) => [...prev, { name: '', days: 1 }])
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const intervalsObj: Record<string, number> = {}
    for (const item of intervals) {
      if (item.name.trim()) intervalsObj[item.name.trim()] = item.days
    }
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [
          { key: 'teamwork_bonus_percent', value: teamworkPercent },
          { key: 'recurring_intervals', value: intervalsObj },
        ],
      }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg('Gespeichert ✓')
      router.refresh()
    } else {
      setMsg('Fehler beim Speichern')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-1">Teamwork-Bonus</h2>
        <p className="text-sm text-slate-500 mb-3">Zusätzlicher Bonus wenn eine Aufgabe zusammen erledigt wird.</p>
        <div className="flex items-center gap-2">
          <Input type="number" className="w-20 text-center" value={teamworkPercent} onChange={(e) => setTeamworkPercent(Number(e.target.value))} />
          <span className="text-sm text-slate-500">%</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">Wiederkehr-Intervalle</h2>
        <p className="text-sm text-slate-500 mb-3">Definiert die verfügbaren Intervalle für wiederkehrende Aufgaben.</p>
        <div className="space-y-2">
          {intervals.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center">
              <Input className="flex-1" placeholder="Name (z.B. daily)" value={item.name} onChange={(e) => updateInterval(i, 'name', e.target.value)} />
              <Input type="number" className="w-16 text-center" value={item.days} onChange={(e) => updateInterval(i, 'days', Number(e.target.value))} />
              <span className="text-sm text-slate-400">Tage</span>
              <button onClick={() => removeInterval(i)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addInterval}>+ Intervall hinzufügen</Button>
      </div>

      <div className="flex items-center justify-between">
        {msg && <p className="text-sm text-slate-500">{msg}</p>}
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/settings/tabs/
git commit -m "feat: implement Benutzer, Streak, Level, Boni settings tabs"
```

---

### Task 11: Settings Tabs — Kategorien and Achievements

**Files:**
- Modify: `src/app/(app)/settings/tabs/categories-tab.tsx`
- Modify: `src/app/(app)/settings/tabs/achievements-tab.tsx`

- [ ] **Step 1: Implement CategoriesTab**

Replace `src/app/(app)/settings/tabs/categories-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Category = { id: string; name: string; emoji: string; taskCount: number }

export function CategoriesTab({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [edits, setEdits] = useState<Record<string, { name: string; emoji: string }>>({})
  const [newCat, setNewCat] = useState({ name: '', emoji: '📁' })
  const [msg, setMsg] = useState('')

  function startEdit(cat: Category) {
    setEdits((prev) => ({ ...prev, [cat.id]: { name: cat.name, emoji: cat.emoji } }))
  }

  async function saveEdit(id: string) {
    const edit = edits[id]
    if (!edit) return
    const res = await fetch(`/api/settings/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    })
    if (res.ok) {
      setEdits((prev) => { const next = { ...prev }; delete next[id]; return next })
      setMsg('Gespeichert ✓')
      router.refresh()
    }
  }

  async function deleteCat(id: string) {
    const res = await fetch(`/api/settings/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setMsg('Gelöscht ✓')
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? 'Fehler')
    }
  }

  async function createCat() {
    if (!newCat.name.trim() || !newCat.emoji.trim()) return
    const res = await fetch('/api/settings/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    })
    if (res.ok) {
      setNewCat({ name: '', emoji: '📁' })
      setMsg('Erstellt ✓')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Kategorien für die Aufgaben-Gruppierung.</p>
      <div className="space-y-2">
        {categories.map((cat) => {
          const edit = edits[cat.id]
          return (
            <div key={cat.id} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center">
              {edit ? (
                <>
                  <Input className="w-12 text-center text-lg" value={edit.emoji} onChange={(e) => setEdits((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], emoji: e.target.value } }))} />
                  <Input className="flex-1" value={edit.name} onChange={(e) => setEdits((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], name: e.target.value } }))} />
                  <Button size="sm" onClick={() => saveEdit(cat.id)}>✓</Button>
                  <button onClick={() => setEdits((prev) => { const next = { ...prev }; delete next[cat.id]; return next })} className="text-slate-400 px-1">✕</button>
                </>
              ) : (
                <>
                  <span className="text-lg w-8 text-center">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.taskCount} Tasks</span>
                  <button onClick={() => startEdit(cat)} className="text-slate-400 hover:text-slate-600 text-sm">✏️</button>
                  <button onClick={() => deleteCat(cat.id)} className="text-red-400 hover:text-red-600 text-lg px-1" title={cat.taskCount > 0 ? 'Erst Tasks umziehen' : 'Löschen'}>×</button>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-3 flex gap-2 items-center">
        <Input className="w-12 text-center text-lg" value={newCat.emoji} onChange={(e) => setNewCat((prev) => ({ ...prev, emoji: e.target.value }))} />
        <Input className="flex-1" placeholder="Neue Kategorie" value={newCat.name} onChange={(e) => setNewCat((prev) => ({ ...prev, name: e.target.value }))} />
        <Button onClick={createCat} disabled={!newCat.name.trim()}>Erstellen</Button>
      </div>

      {cat.taskCount > 0 && (
        <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          ⚠️ Kategorien mit zugeordneten Tasks können nicht gelöscht werden.
        </div>
      )}

      {msg && <p className="text-sm text-slate-500">{msg}</p>}
    </div>
  )
}
```

**Note:** The warning div above has a bug — `cat` is not in scope outside the `.map()`. Move the warning to a static position. The correct code should be:

```typescript
      {categories.some((c) => c.taskCount > 0) && (
        <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          ⚠️ Kategorien mit zugeordneten Tasks können nicht gelöscht werden. Erst alle Tasks umziehen oder archivieren.
        </div>
      )}
```

- [ ] **Step 2: Implement AchievementsTab**

Replace `src/app/(app)/settings/tabs/achievements-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Achievement = {
  id: string; title: string; description: string; emoji: string
  conditionType: string; conditionValue: number; conditionMeta: string | null; sortOrder: number
}
type Category = { id: string; name: string; emoji: string; taskCount: number }

const CONDITION_LABELS: Record<string, string> = {
  task_count: 'Aufgaben-Anzahl',
  category_count: 'Kategorie-Anzahl',
  streak_days: 'Streak-Tage',
  total_points: 'Gesamtpunkte',
  level: 'Level',
}

const CONDITION_TYPES = Object.keys(CONDITION_LABELS)

export function AchievementsTab({ achievements: initial, categories }: { achievements: Achievement[]; categories: Category[] }) {
  const router = useRouter()
  const [achievements, setAchievements] = useState(initial)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Achievement>>({})
  const [msg, setMsg] = useState('')

  function startEdit(ach: Achievement) {
    setEditId(ach.id)
    setForm({ ...ach })
  }

  function startCreate() {
    setEditId('new')
    setForm({ emoji: '⭐', title: '', description: '', conditionType: 'task_count', conditionValue: 1, conditionMeta: null, sortOrder: achievements.length + 1 })
  }

  async function save() {
    if (!form.title || !form.emoji || !form.conditionType || form.conditionValue == null) return
    const isNew = editId === 'new'
    const url = isNew ? '/api/settings/achievements' : `/api/settings/achievements/${editId}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setEditId(null)
      setForm({})
      setMsg(isNew ? 'Erstellt ✓' : 'Gespeichert ✓')
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? 'Fehler')
    }
  }

  async function deleteAch(id: string) {
    const res = await fetch(`/api/settings/achievements/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAchievements((prev) => prev.filter((a) => a.id !== id))
      setMsg('Gelöscht ✓')
      router.refresh()
    }
  }

  function cancel() {
    setEditId(null)
    setForm({})
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Achievements werden automatisch freigeschaltet wenn die Bedingung erfüllt ist.</p>

      {editId && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border-2 border-indigo-200">
          <h3 className="font-semibold text-sm">{editId === 'new' ? 'Neues Achievement' : 'Achievement bearbeiten'}</h3>
          <div className="flex gap-2">
            <Input className="w-14 text-center text-lg" placeholder="Emoji" value={form.emoji ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))} />
            <Input className="flex-1" placeholder="Titel" value={form.title ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <Input placeholder="Beschreibung" value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="flex gap-2 flex-wrap items-center">
            <select
              className="border rounded-md px-2 py-1.5 text-sm"
              value={form.conditionType ?? 'task_count'}
              onChange={(e) => setForm((prev) => ({ ...prev, conditionType: e.target.value, conditionMeta: null }))}
            >
              {CONDITION_TYPES.map((t) => (
                <option key={t} value={t}>{CONDITION_LABELS[t]}</option>
              ))}
            </select>
            <span className="text-sm text-slate-500">≥</span>
            <Input type="number" className="w-20 text-center" value={form.conditionValue ?? 1} onChange={(e) => setForm((prev) => ({ ...prev, conditionValue: Number(e.target.value) }))} />
            {form.conditionType === 'category_count' && (
              <select
                className="border rounded-md px-2 py-1.5 text-sm"
                value={form.conditionMeta ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, conditionMeta: e.target.value || null }))}
              >
                <option value="">Kategorie wählen</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            )}
            <label className="text-xs text-slate-500 ml-auto">Reihenfolge:</label>
            <Input type="number" className="w-14 text-center" value={form.sortOrder ?? 0} onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={cancel}>Abbrechen</Button>
            <Button onClick={save}>Speichern</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {achievements.map((ach) => (
          <div key={ach.id} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center">
            <span className="text-lg w-8 text-center">{ach.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ach.title}</p>
              <p className="text-xs text-slate-400">{CONDITION_LABELS[ach.conditionType] ?? ach.conditionType} ≥ {ach.conditionValue}</p>
            </div>
            <button onClick={() => startEdit(ach)} className="text-slate-400 hover:text-slate-600 text-sm">✏️</button>
            <button onClick={() => deleteAch(ach.id)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
          </div>
        ))}
      </div>

      {!editId && (
        <Button variant="outline" className="w-full" onClick={startCreate}>+ Achievement hinzufügen</Button>
      )}

      <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
        ℹ️ Bereits freigeschaltete Achievements bleiben erhalten, auch wenn die Bedingung geändert wird.
      </div>

      {msg && <p className="text-sm text-slate-500">{msg}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/settings/tabs/categories-tab.tsx src/app/\(app\)/settings/tabs/achievements-tab.tsx
git commit -m "feat: implement Kategorien and Achievements settings tabs"
```

---

### Task 12: Settings Tabs — Tasks and Store (migrated from /admin)

**Files:**
- Modify: `src/app/(app)/settings/tabs/tasks-tab.tsx`
- Modify: `src/app/(app)/settings/tabs/store-tab.tsx`

- [ ] **Step 1: Implement TasksTab (migrated from admin-client)**

Replace `src/app/(app)/settings/tabs/tasks-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Category = { id: string; name: string; emoji: string; taskCount: number }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: { id: string; name: string; emoji: string } }

export function TasksTab({ tasks, categories, userId }: { tasks: Task[]; categories: Category[]; userId: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', emoji: '🏠', points: 30, categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
    allowMultiple: false, dailyLimit: 3,
  })

  async function createTask() {
    setError('')
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm((prev) => ({ ...prev, title: '' }))
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Anlegen')
    }
  }

  async function archiveTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold">Neue Aufgabe anlegen</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Emoji</Label>
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          </div>
          <div>
            <Label>Punkte</Label>
            <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label>Titel</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>Kategorie</Label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="recurring" checked={form.isRecurring}
            onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
          <Label htmlFor="recurring">Wiederkehrend</Label>
          {form.isRecurring && (
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={form.recurringInterval}
              onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
            >
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="monthly">Monatlich</option>
            </select>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="allowMultiple" checked={form.allowMultiple}
            onChange={(e) => setForm({ ...form, allowMultiple: e.target.checked })} />
          <Label htmlFor="allowMultiple">Mehrfach pro Tag</Label>
          {form.allowMultiple && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-500">max</span>
              <Input type="number" className="w-16" value={form.dailyLimit}
                onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })} />
              <span className="text-sm text-slate-500">×/Tag</span>
            </div>
          )}
        </div>
        <Button onClick={createTask} disabled={!form.title || !form.categoryId}>
          Aufgabe anlegen (→ Freigabe nötig)
        </Button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Aktive Aufgaben ({tasks.length})</h2>
        <Link href="/manage" className="text-xs text-indigo-500 hover:text-indigo-700">Bearbeiten → /manage</Link>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
            <span>{t.emoji}</span>
            <span className="flex-1 text-sm">{t.title}</span>
            <span className="text-xs text-slate-400">{t.status}</span>
            <Button variant="outline" size="sm" onClick={() => archiveTask(t.id)}>Archivieren</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement StoreTab (migrated from admin-client)**

Replace `src/app/(app)/settings/tabs/store-tab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }

export function StoreTab({ storeItems }: { storeItems: StoreItem[] }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', emoji: '🎁', description: '', pointCost: 500, type: 'real_reward',
  })

  async function createItem() {
    setError('')
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isActive: true }),
    })
    if (res.ok) {
      setForm((prev) => ({ ...prev, title: '', description: '' }))
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Anlegen')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold">Neue Belohnung anlegen</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Emoji</Label>
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          </div>
          <div>
            <Label>Preis (Pkt)</Label>
            <Input type="number" value={form.pointCost} onChange={(e) => setForm({ ...form, pointCost: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label>Titel</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>Beschreibung</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <Label>Typ</Label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="trophy">🏆 Trophäe</option>
            <option value="real_reward">🎁 Belohnung</option>
          </select>
        </div>
        <Button onClick={createItem} disabled={!form.title || !form.description}>
          Artikel anlegen
        </Button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Bestehende Belohnungen</h2>
      <div className="space-y-2">
        {storeItems.filter((i) => i.type !== 'streak_restore').map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
            <span>{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-slate-400">{item.pointCost} Pkt · {item.type}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {item.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/settings/tabs/tasks-tab.tsx src/app/\(app\)/settings/tabs/store-tab.tsx
git commit -m "feat: implement Tasks and Store settings tabs (migrated from /admin)"
```

---

### Task 13: Profile Gear Link, Remove /admin, Clean Up Profile

**Files:**
- Modify: `src/app/(app)/profile/page.tsx`
- Modify: `src/app/(app)/profile/profile-client.tsx`
- Delete: `src/app/(app)/admin/page.tsx`
- Delete: `src/app/(app)/admin/admin-client.tsx`

- [ ] **Step 1: Add gear icon link to profile page**

In `src/app/(app)/profile/profile-client.tsx`, add a gear icon link in the header section. After the `</div>` closing the `ml-auto` points div (around line 122), add:

```typescript
          <Link href="/settings" className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </Link>
```

Make sure `Link` from `next/link` is already imported (it is).

- [ ] **Step 2: Remove admin-related code from profile-client.tsx**

In `src/app/(app)/profile/profile-client.tsx`:

1. Remove the `StoreItem` and `Task` types (lines 19-20)
2. Remove `storeItems`, `tasks`, `userId` from the component props
3. Remove the entire "Settings section" block (lines 247-310) — the `{isOwnProfile && (` block with task archiving, store items, and PIN change
4. Remove the `archiveTask` function (lines 67-70)
5. Remove the `users`, `newPin`, `pinMsg` state and `changePin` function (lines 73-103)
6. Remove the `useEffect` that fetches users (lines 78-84)

- [ ] **Step 3: Update profile/page.tsx to remove admin data**

In `src/app/(app)/profile/page.tsx`:

1. Remove the storeItems and tasks queries (lines 51-60)
2. Remove `storeItems`, `tasks`, `userId` from the `ProfileClient` props (lines 79-82)

The resulting page.tsx should be:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from './profile-client'
import { computeProfileStats } from '@/lib/profile-stats'
import { loadGameConfig } from '@/lib/config'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id
  const config = await loadGameConfig()

  const stats = await computeProfileStats(userId, config.levelDefinitions)

  const categories = await prisma.category.findMany()

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { item: { select: { title: true, emoji: true, type: true } } },
    orderBy: { purchasedAt: 'desc' },
  })

  const purchasesForClient = purchases.map((p) => ({
    id: p.id,
    purchasedAt: p.purchasedAt.toISOString(),
    redeemedAt: p.redeemedAt?.toISOString() ?? null,
    pointsSpent: p.pointsSpent,
    item: p.item,
  }))

  const allAchievements = await prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } })
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId))

  const achievementsSummary = {
    total: allAchievements.length,
    unlocked: unlockedIds.size,
    previews: allAchievements.slice(0, 8).map((a) => ({
      id: a.id,
      emoji: a.emoji,
      unlocked: unlockedIds.has(a.id),
    })),
  }

  const userName = session.user.name ?? 'Profil'

  return (
    <ProfileClient
      userName={userName}
      personal={{
        heatmap: stats.heatmap,
        topTasks: stats.topTasks,
        streak: stats.streak,
        totalCompletions: stats.completionCount,
        totalPointsEarned: stats.totalEarned,
        level: stats.level,
        purchases: purchasesForClient,
      }}
      categories={categories}
      achievementsSummary={achievementsSummary}
      isOwnProfile={true}
    />
  )
}
```

- [ ] **Step 4: Delete /admin files**

```bash
rm src/app/\(app\)/admin/page.tsx src/app/\(app\)/admin/admin-client.tsx
rmdir src/app/\(app\)/admin
```

- [ ] **Step 5: Verify build**

Run: `npx next build`
Expected: Build succeeds. No references to deleted admin files remain.

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add settings gear link to profile, remove /admin page"
```

---

### Task 14: Final Integration Test and Cleanup

**Files:**
- Potentially any file that has issues from the build

- [ ] **Step 1: Full build verification**

Run: `npx next build`
Expected: Build succeeds with zero errors.

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 3: Manual smoke test checklist**

Start dev server: `npm run dev`

Verify:
1. Dashboard loads correctly (streak tier, level, points all use DB-backed config or defaults)
2. Profile page shows gear icon → clicking navigates to `/settings`
3. `/settings` loads with 8 tabs
4. Benutzer tab: can change name, can change PIN
5. Streak tab: shows current tiers, can modify and save
6. Level tab: shows current levels, can add/remove/edit
7. Boni tab: teamwork bonus and intervals editable
8. Kategorien tab: shows categories with task count, can create/edit/delete
9. Achievements tab: shows all achievements, can create/edit/delete
10. Tasks tab: can create new task (same as old admin)
11. Store tab: can create new store item (same as old admin)
12. `/admin` returns 404
13. `/manage` still works as before
14. Task completion still calculates correct bonuses
15. Streak restore still works

- [ ] **Step 4: Fix any issues found**

Address any build errors, type mismatches, or runtime issues.

- [ ] **Step 5: Final commit (if any fixes)**

```bash
git add -A
git commit -m "fix: address integration issues from settings page"
```
