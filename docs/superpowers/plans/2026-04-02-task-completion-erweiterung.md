# Task-Completion-Erweiterung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Erweitere das Task-Completion-System um gemeinsames Erledigen (mit +10% Teamwork-Bonus) und konfigurierbares Mehrfach-Erledigen pro Tag.

**Architecture:** Minimale Schema-Erweiterung: Task bekommt `allowMultiple` + `dailyLimit`, TaskCompletion bekommt `withUserId`. Gemeinsame Completions erstellen zwei eigenständige Einträge. `applyBonus()` wird um `isShared`-Parameter erweitert. Dashboard und Feed werden für Teamwork-Anzeige angepasst.

**Tech Stack:** Next.js, Prisma (SQLite), TypeScript, Tailwind CSS, Vitest

---

## File Structure

**Create:**
- `prisma/migrations/<timestamp>_add_shared_and_multi_completion/migration.sql` — DB migration
- `src/tests/lib/streak-teamwork.test.ts` — Tests für erweiterte applyBonus-Funktion

**Modify:**
- `prisma/schema.prisma` — Task + TaskCompletion Schema-Erweiterung, User Relation
- `src/lib/streak.ts` — `TEAMWORK_BONUS_PERCENT`, `applyBonus` erweitern
- `src/tests/lib/streak.test.ts` — Bestehende Tests anpassen
- `src/app/api/tasks/[id]/complete/route.ts` — Shared completion + Multi-completion Logik
- `src/app/api/tasks/[id]/complete/undo/route.ts` — Shared undo Logik
- `src/app/api/tasks/route.ts` — Neue Felder beim Erstellen
- `src/app/api/tasks/[id]/route.ts` — Neue Felder beim Bearbeiten
- `src/app/(app)/page.tsx` — Dashboard: Multi-completion Zähler, Teamwork-Toggle Daten
- `src/components/dashboard/today-section.tsx` — Teamwork-Toggle, Multi-Zähler UI
- `src/components/dashboard/grouped-feed.tsx` — Teamwork-Anzeige im Feed
- `src/lib/dashboard.ts` — FeedEntry-Typ erweitern
- `src/components/tasks/task-card.tsx` — Teamwork-Toggle auf Tasks-Seite
- `src/components/tasks/create-task-dialog.tsx` — allowMultiple + dailyLimit Felder
- `src/components/manage/task-row.tsx` — allowMultiple + dailyLimit im Edit-Modus
- `src/app/(app)/manage/manage-client.tsx` — Task-Typ erweitern
- `scripts/docker-entrypoint.sh` — Seed-Script anpassen

---

### Task 1: Prisma Schema erweitern

**Files:**
- Modify: `prisma/schema.prisma:32-51` (Task model)
- Modify: `prisma/schema.prisma:64-73` (TaskCompletion model)
- Modify: `prisma/schema.prisma:10-23` (User model)

- [ ] **Step 1: Task-Modell um allowMultiple und dailyLimit erweitern**

In `prisma/schema.prisma`, füge zwei Felder zum Task-Modell hinzu (nach `nextDueAt`):

```prisma
model Task {
  id                String    @id @default(cuid())
  title             String
  emoji             String
  points            Int
  isRecurring       Boolean   @default(false)
  recurringInterval String?
  status            String    @default("pending_approval")
  categoryId        String
  createdById       String
  approvedById      String?
  createdAt         DateTime  @default(now())
  nextDueAt         DateTime?
  allowMultiple     Boolean   @default(false)
  dailyLimit        Int?

  category    Category         @relation(fields: [categoryId], references: [id])
  createdBy   User             @relation("CreatedBy", fields: [createdById], references: [id])
  approvedBy  User?            @relation("ApprovedBy", fields: [approvedById], references: [id])
  completions TaskCompletion[]
  approval    TaskApproval?
}
```

- [ ] **Step 2: TaskCompletion-Modell um withUserId erweitern**

```prisma
model TaskCompletion {
  id          String   @id @default(cuid())
  taskId      String
  userId      String
  points      Int
  completedAt DateTime @default(now())
  withUserId  String?

  task     Task  @relation(fields: [taskId], references: [id])
  user     User  @relation(fields: [userId], references: [id])
  withUser User? @relation("sharedCompletions", fields: [withUserId], references: [id])
}
```

- [ ] **Step 3: User-Modell um sharedCompletions Relation erweitern**

Im User-Modell nach `streakState` hinzufügen:

```prisma
model User {
  id          String   @id @default(cuid())
  name        String
  pin         String
  createdAt   DateTime @default(now())

  completions        TaskCompletion[]
  purchases          Purchase[]
  createdTasks       Task[]           @relation("CreatedBy")
  approvedTasks      Task[]           @relation("ApprovedBy")
  approvals          TaskApproval[]
  userAchievements   UserAchievement[]
  streakState        StreakState?
  sharedCompletions  TaskCompletion[] @relation("sharedCompletions")
}
```

- [ ] **Step 4: Migration erstellen und anwenden**

Run: `npx prisma migrate dev --name add_shared_and_multi_completion`

Expected: Migration erstellt SQL mit drei ALTER TABLE Statements:
- `ALTER TABLE "Task" ADD COLUMN "allowMultiple" BOOLEAN NOT NULL DEFAULT false`
- `ALTER TABLE "Task" ADD COLUMN "dailyLimit" INTEGER`
- `ALTER TABLE "TaskCompletion" ADD COLUMN "withUserId" TEXT`

- [ ] **Step 5: Prisma Client generieren und verifizieren**

Run: `npx prisma generate`
Expected: Prisma Client erfolgreich generiert

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add allowMultiple, dailyLimit to Task and withUserId to TaskCompletion"
```

---

### Task 2: applyBonus um Teamwork-Bonus erweitern

**Files:**
- Modify: `src/lib/streak.ts:1-24`
- Modify: `src/tests/lib/streak.test.ts:58-86`

- [ ] **Step 1: Tests für erweiterten applyBonus schreiben**

In `src/tests/lib/streak.test.ts`, die bestehenden `applyBonus`-Tests erweitern. Ersetze den gesamten `describe('applyBonus', ...)` Block:

```typescript
describe('applyBonus', () => {
  it('returns base points when no bonus (streak 0)', () => {
    expect(applyBonus(20, 0)).toBe(20)
  })

  it('applies 5% bonus and floors the result', () => {
    expect(applyBonus(20, 3)).toBe(21)
  })

  it('applies 10% bonus', () => {
    expect(applyBonus(20, 7)).toBe(22)
  })

  it('applies 25% bonus', () => {
    expect(applyBonus(20, 14)).toBe(25)
  })

  it('applies 50% bonus', () => {
    expect(applyBonus(20, 30)).toBe(30)
  })

  it('floors fractional points', () => {
    expect(applyBonus(15, 3)).toBe(15)
  })

  it('floors 10% on odd base points', () => {
    expect(applyBonus(25, 7)).toBe(27)
  })

  // Teamwork bonus tests
  it('applies 10% teamwork bonus when shared, no streak', () => {
    expect(applyBonus(20, 0, true)).toBe(22)
  })

  it('applies teamwork + streak bonus additively (5% + 10%)', () => {
    // 35 * 1.15 = 40.25 → 40
    expect(applyBonus(35, 3, true)).toBe(40)
  })

  it('applies teamwork + streak bonus additively (10% + 10%)', () => {
    // 35 * 1.20 = 42
    expect(applyBonus(35, 7, true)).toBe(42)
  })

  it('applies teamwork + streak bonus additively (25% + 10%)', () => {
    // 20 * 1.35 = 27
    expect(applyBonus(20, 14, true)).toBe(27)
  })

  it('applies teamwork + streak bonus additively (50% + 10%)', () => {
    // 20 * 1.60 = 32
    expect(applyBonus(20, 30, true)).toBe(32)
  })

  it('isShared defaults to false', () => {
    expect(applyBonus(20, 7)).toBe(applyBonus(20, 7, false))
  })
})
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npx vitest run src/tests/lib/streak.test.ts`
Expected: FAIL — `applyBonus` akzeptiert keinen dritten Parameter

- [ ] **Step 3: TEAMWORK_BONUS_PERCENT und applyBonus implementieren**

In `src/lib/streak.ts`, nach der `STREAK_TIERS` Konstante (Zeile 9) hinzufügen:

```typescript
export const TEAMWORK_BONUS_PERCENT = 10
```

Die `applyBonus` Funktion (Zeilen 21-24) ersetzen:

```typescript
export function applyBonus(basePoints: number, currentStreak: number, isShared: boolean = false): number {
  const tier = getStreakTier(currentStreak)
  const totalPercent = tier.percent + (isShared ? TEAMWORK_BONUS_PERCENT : 0)
  return Math.floor(basePoints * (1 + totalPercent / 100))
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npx vitest run src/tests/lib/streak.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/streak.ts src/tests/lib/streak.test.ts
git commit -m "feat: add teamwork bonus to applyBonus function"
```

---

### Task 3: Complete-API um Shared und Multi-Completion erweitern

**Files:**
- Modify: `src/app/api/tasks/[id]/complete/route.ts`

- [ ] **Step 1: Complete-Route komplett ersetzen**

Ersetze den gesamten Inhalt von `src/app/api/tasks/[id]/complete/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextDueAt } from '@/lib/recurring'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { applyBonus, updateStreakOnCompletion } from '@/lib/streak'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  let withUserId: string | undefined

  try {
    const body = await req.json()
    withUserId = body.withUserId
  } catch {
    // No body or invalid JSON — solo completion
  }

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task || task.status !== 'active') {
    return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
  }

  // Multi-completion limit check
  if (!task.allowMultiple) {
    // Standard: check if already completed today
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const existingToday = await prisma.taskCompletion.findFirst({
      where: { taskId: task.id, userId, completedAt: { gte: todayStart } },
    })
    if (existingToday) {
      return NextResponse.json({ error: 'Aufgabe heute bereits erledigt' }, { status: 409 })
    }
  } else if (task.dailyLimit) {
    // Multi: check against daily limit
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const todayCount = await prisma.taskCompletion.count({
      where: { taskId: task.id, userId, completedAt: { gte: todayStart } },
    })
    if (todayCount >= task.dailyLimit) {
      return NextResponse.json({ error: `Tageslimit erreicht (${task.dailyLimit}x)` }, { status: 409 })
    }
  }

  const isShared = !!withUserId

  // Update streak and calculate bonus for current user
  const { currentStreak } = await updateStreakOnCompletion(userId)
  const pointsWithBonus = applyBonus(task.points, currentStreak, isShared)

  const completion = await prisma.taskCompletion.create({
    data: {
      taskId: task.id,
      userId,
      points: pointsWithBonus,
      withUserId: withUserId ?? null,
    },
  })

  // Create partner completion if shared
  let partnerCompletion = null
  if (withUserId) {
    const { currentStreak: partnerStreak } = await updateStreakOnCompletion(withUserId)
    const partnerPoints = applyBonus(task.points, partnerStreak, true)
    partnerCompletion = await prisma.taskCompletion.create({
      data: {
        taskId: task.id,
        userId: withUserId,
        points: partnerPoints,
        withUserId: userId,
      },
    })
  }

  // Handle recurring/one-time task state
  if (task.allowMultiple && task.dailyLimit) {
    // Only set nextDueAt when daily limit is reached
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const newCount = await prisma.taskCompletion.count({
      where: { taskId: task.id, userId, completedAt: { gte: todayStart } },
    })
    if (newCount >= task.dailyLimit && task.isRecurring && task.recurringInterval) {
      const nextDueAt = getNextDueAt(task.recurringInterval, new Date())
      await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
    }
  } else if (task.isRecurring && task.recurringInterval) {
    const nextDueAt = getNextDueAt(task.recurringInterval, new Date())
    await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
  } else {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'archived' },
    })
  }

  // Achievement check for current user
  let newAchievements: { id: string; title: string; emoji: string }[] = []
  try {
    const newAchievementIds = await checkAndUnlockAchievements(userId)
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

  // Achievement check for partner
  if (withUserId) {
    try {
      await checkAndUnlockAchievements(withUserId)
    } catch {
      // Silent fail
    }
  }

  return NextResponse.json({
    ...completion,
    basePoints: task.points,
    bonusPoints: pointsWithBonus - task.points,
    streakDays: currentStreak,
    isShared,
    newAchievements,
  }, { status: 201 })
}
```

- [ ] **Step 2: Build-Check**

Run: `npx tsc --noEmit`
Expected: Keine Typfehler

- [ ] **Step 3: Commit**

```bash
git add src/app/api/tasks/[id]/complete/route.ts
git commit -m "feat: support shared and multi-completion in complete API"
```

---

### Task 4: Undo-API für Shared Completions erweitern

**Files:**
- Modify: `src/app/api/tasks/[id]/complete/undo/route.ts`

- [ ] **Step 1: Undo-Route ersetzen**

Ersetze den gesamten Inhalt von `src/app/api/tasks/[id]/complete/undo/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }
  const { completionId } = body

  if (!completionId || typeof completionId !== 'string') {
    return NextResponse.json({ error: 'completionId erforderlich' }, { status: 400 })
  }

  const completion = await prisma.taskCompletion.findUnique({
    where: { id: completionId },
  })

  if (!completion) {
    return NextResponse.json({ error: 'Erledigung nicht gefunden' }, { status: 404 })
  }

  if (completion.userId !== session.user.id) {
    return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }

  // Nur innerhalb von 5 Minuten rückgängig machbar
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  if (completion.completedAt < fiveMinutesAgo) {
    return NextResponse.json({ error: 'Zeitfenster abgelaufen' }, { status: 410 })
  }

  await prisma.$transaction(async (tx) => {
    // Delete this completion
    await tx.taskCompletion.delete({ where: { id: completionId } })

    // If shared, also delete the partner's completion
    if (completion.withUserId) {
      const partnerCompletion = await tx.taskCompletion.findFirst({
        where: {
          taskId: completion.taskId,
          userId: completion.withUserId,
          withUserId: completion.userId,
          completedAt: {
            gte: new Date(completion.completedAt.getTime() - 5000),
            lte: new Date(completion.completedAt.getTime() + 5000),
          },
        },
      })
      if (partnerCompletion) {
        await tx.taskCompletion.delete({ where: { id: partnerCompletion.id } })
      }
    }

    const task = await tx.task.findUnique({ where: { id: params.id } })
    if (task) {
      if (task.isRecurring && task.recurringInterval) {
        // Wiederkehrende Aufgabe: nextDueAt zurücksetzen auf jetzt (sofort wieder sichtbar)
        await tx.task.update({ where: { id: params.id }, data: { nextDueAt: new Date() } })
      } else if (task.status === 'archived') {
        // Einmalige Aufgabe: zurück auf active
        await tx.task.update({ where: { id: params.id }, data: { status: 'active' } })
      }
    }
  })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/tasks/[id]/complete/undo/route.ts
git commit -m "feat: undo shared completions deletes both entries"
```

---

### Task 5: Task-Erstellungs- und Bearbeitungs-APIs erweitern

**Files:**
- Modify: `src/app/api/tasks/route.ts:24-66`
- Modify: `src/app/api/tasks/[id]/route.ts:6-38`

- [ ] **Step 1: POST in tasks/route.ts erweitern**

In `src/app/api/tasks/route.ts`, die POST-Funktion anpassen. Ersetze Zeilen 24-66:

```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, emoji, points, categoryId, isRecurring, recurringInterval, allowMultiple, dailyLimit } = body

  if (!title || !emoji || !points || !categoryId) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const parsedPoints = Number(points)
  if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
    return NextResponse.json({ error: 'Punkte müssen eine positive ganze Zahl sein' }, { status: 400 })
  }

  const { task } = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title,
        emoji,
        points: parsedPoints,
        categoryId,
        isRecurring: Boolean(isRecurring),
        recurringInterval: isRecurring ? recurringInterval : null,
        allowMultiple: Boolean(allowMultiple),
        dailyLimit: allowMultiple && dailyLimit ? Number(dailyLimit) : null,
        status: 'pending_approval',
        createdById: session.user.id,
      },
    })

    await tx.taskApproval.create({
      data: {
        taskId: task.id,
        requestedById: session.user.id,
        status: 'pending',
      },
    })

    return { task }
  })

  return NextResponse.json(task, { status: 201 })
}
```

- [ ] **Step 2: PATCH in tasks/[id]/route.ts erweitern**

In `src/app/api/tasks/[id]/route.ts`, die PATCH-Funktion anpassen. Ersetze Zeilen 6-38:

```typescript
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowedStatuses = ['active', 'archived']

  try {
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: body.title,
        emoji: body.emoji,
        points: body.points !== undefined ? Number(body.points) : undefined,
        categoryId: body.categoryId,
        isRecurring: body.isRecurring,
        recurringInterval: body.recurringInterval ?? null,
        allowMultiple: body.allowMultiple !== undefined ? Boolean(body.allowMultiple) : undefined,
        dailyLimit: body.allowMultiple === false ? null : (body.dailyLimit !== undefined ? Number(body.dailyLimit) : undefined),
        ...(typeof body.status === 'string' && allowedStatuses.includes(body.status)
          ? { status: body.status }
          : {}),
      },
    })
    return NextResponse.json(task)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
    }
    throw error
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/tasks/route.ts src/app/api/tasks/[id]/route.ts
git commit -m "feat: support allowMultiple and dailyLimit in task create/update APIs"
```

---

### Task 6: Dashboard-Daten für Shared + Multi-Completion erweitern

**Files:**
- Modify: `src/app/(app)/page.tsx`

- [ ] **Step 1: Dashboard-Page anpassen**

In `src/app/(app)/page.tsx`, mehrere Änderungen:

**a) Partner-ID an TodaySection übergeben.** Ersetze die `TodaySection`-Nutzung (Zeilen 199-203):

```typescript
      <TodaySection
        completed={completedToday}
        due={dueTasks}
        suggestions={suggestions}
        partnerId={partner?.id}
        partnerName={partner?.name ?? 'Partner'}
      />
```

**b) DueTask-Typ erweitern.** Die Queries müssen `allowMultiple` und `dailyLimit` enthalten. Ersetze die beiden Queries (Zeilen 55-71):

```typescript
  const [todayCompletions, recurringTasks] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId, completedAt: { gte: todayStart } },
      include: { task: { select: { id: true, emoji: true, title: true, points: true, allowMultiple: true, dailyLimit: true } } },
    }),
    prisma.task.findMany({
      where: {
        status: 'active',
        isRecurring: true,
        OR: [
          { nextDueAt: null },
          { nextDueAt: { lte: now } },
        ],
      },
      select: { id: true, emoji: true, title: true, points: true, allowMultiple: true, dailyLimit: true },
    }),
  ])
```

**c) Completion-Zähler und Filter anpassen.** Ersetze die `completedToday`/`dueTasks` Berechnung (Zeilen 72-79):

```typescript
  const completedToday = todayCompletions.map((c) => ({
    id: c.id,
    emoji: c.task.emoji,
    title: c.task.title,
    points: c.points,
  }))

  // Count completions per task for multi-completion support
  const completionCountByTask = new Map<string, number>()
  for (const c of todayCompletions) {
    completionCountByTask.set(c.taskId, (completionCountByTask.get(c.taskId) ?? 0) + 1)
  }

  const dueTasks = recurringTasks
    .filter((t) => {
      const count = completionCountByTask.get(t.id) ?? 0
      if (t.allowMultiple && t.dailyLimit) {
        return count < t.dailyLimit
      }
      return count === 0
    })
    .map((t) => ({
      ...t,
      todayCount: completionCountByTask.get(t.id) ?? 0,
    }))
```

- [ ] **Step 2: Build-Check**

Run: `npx tsc --noEmit`
Expected: Typfehler bei TodaySection Props (erwartet — wird in Task 7 behoben)

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/page.tsx
git commit -m "feat: dashboard data layer for shared and multi-completion"
```

---

### Task 7: TodaySection mit Teamwork-Toggle und Multi-Zähler

**Files:**
- Modify: `src/components/dashboard/today-section.tsx`

- [ ] **Step 1: TodaySection komplett ersetzen**

Ersetze den gesamten Inhalt von `src/components/dashboard/today-section.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Check, Users } from 'lucide-react'

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
  allowMultiple: boolean
  dailyLimit: number | null
  todayCount: number
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
  partnerId?: string
  partnerName?: string
}

export function TodaySection({ completed, due, suggestions, partnerId, partnerName }: TodaySectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [sharedTaskId, setSharedTaskId] = useState<string | null>(null)

  const totalTasks = completed.length + due.length
  const doneCount = completed.length + doneIds.size

  async function handleComplete(task: DueTask) {
    setLoadingId(task.id)
    try {
      const isShared = sharedTaskId === task.id && partnerId
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: isShared ? { 'Content-Type': 'application/json' } : undefined,
        body: isShared ? JSON.stringify({ withUserId: partnerId }) : undefined,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Fehler')
      }
      const data = await res.json()

      if (!task.allowMultiple) {
        setDoneIds((prev) => new Set(prev).add(task.id))
      }
      setSharedTaskId(null)

      const sharedLabel = isShared ? ' 👫' : ''
      toast(`+${data.points} Pkt für "${task.title}"${sharedLabel}`, 'success')

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(`${a.emoji} Achievement freigeschaltet: ${a.title}`, 'success')
          }, 1500 + i * 1500)
        })
      }

      router.refresh()
    } catch (err: any) {
      toast(err.message ?? 'Fehler beim Erledigen', 'error')
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
            <div className="flex-1 min-w-0">
              <span className="text-sm text-slate-800 truncate block">{t.title}</span>
              {t.allowMultiple && t.dailyLimit && (
                <span className="text-[10px] text-slate-400">{t.todayCount}/{t.dailyLimit} heute</span>
              )}
            </div>
            {partnerId && (
              <button
                onClick={() => setSharedTaskId(sharedTaskId === t.id ? null : t.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  sharedTaskId === t.id
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                }`}
                title={`Zusammen mit ${partnerName}`}
              >
                <Users size={14} />
              </button>
            )}
            <button
              onClick={() => handleComplete(t)}
              disabled={loadingId === t.id}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {loadingId === t.id ? '…' : <><Check size={14} /> {sharedTaskId === t.id ? '👫 Zusammen' : 'Abhaken'}</>}
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

- [ ] **Step 2: Build-Check**

Run: `npx tsc --noEmit`
Expected: Keine Typfehler

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/today-section.tsx
git commit -m "feat: teamwork toggle and multi-completion counter in TodaySection"
```

---

### Task 8: Feed-Anzeige für Teamwork-Completions

**Files:**
- Modify: `src/lib/dashboard.ts:1-9`
- Modify: `src/components/dashboard/grouped-feed.tsx:6-24`
- Modify: `src/app/(app)/page.tsx` (Feed-Query)

- [ ] **Step 1: FeedEntry-Typ um withUser erweitern**

In `src/lib/dashboard.ts`, den `FeedEntry`-Typ ersetzen (Zeilen 1-9):

```typescript
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
```

- [ ] **Step 2: Feed-Query in page.tsx um withUser erweitern**

In `src/app/(app)/page.tsx`, die completions-Query (Zeilen 113-119) erweitern:

```typescript
    prisma.taskCompletion.findMany({
      take: 30,
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { title: true, emoji: true } },
        withUser: { select: { id: true, name: true } },
      },
    }),
```

Und die feedEntries-Mapping (Zeilen 148-155) um `withUser` erweitern:

```typescript
  const feedEntries: FeedEntry[] = [
    ...completions.map((c) => ({
      id: c.id,
      type: 'completion' as const,
      user: { id: c.user.id, name: c.user.name ?? 'Unbekannt' },
      task: c.task,
      points: c.points,
      at: c.completedAt.toISOString(),
      withUser: c.withUser ? { id: c.withUser.id, name: c.withUser.name ?? 'Unbekannt' } : null,
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
```

- [ ] **Step 3: FeedRow in grouped-feed.tsx für Teamwork anpassen**

In `src/components/dashboard/grouped-feed.tsx`, die `FeedRow`-Komponente ersetzen (Zeilen 6-24):

```typescript
function FeedRow({ entry, currentUserId }: { entry: FeedEntry; currentUserId: string }) {
  const isMe = entry.user.id === currentUserId
  const nameColor = isMe ? 'text-indigo-600' : 'text-pink-600'
  const emoji = entry.type === 'redemption' ? (entry.item?.emoji ?? '🎁') : (entry.task?.emoji ?? '✅')
  const title = entry.type === 'redemption' ? (entry.item?.title ?? '') : (entry.task?.title ?? '')
  const isShared = entry.type === 'completion' && !!entry.withUser

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm border-b border-slate-50 last:border-b-0">
      <span className="text-base">{emoji}</span>
      <span className={`font-semibold ${nameColor}`}>{entry.user.name}</span>
      {isShared && (
        <span className="text-slate-400">&</span>
      )}
      {isShared && (
        <span className={`font-semibold ${entry.withUser!.id === currentUserId ? 'text-indigo-600' : 'text-pink-600'}`}>
          {entry.withUser!.name}
        </span>
      )}
      <span className="text-slate-600 truncate flex-1">{title}</span>
      {isShared && <span className="text-xs">👫</span>}
      {entry.type === 'redemption' ? (
        <span className="text-xs font-semibold text-amber-600 whitespace-nowrap">Belohnung</span>
      ) : (
        <span className={`text-xs font-semibold whitespace-nowrap ${nameColor}`}>+{entry.points}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Feed-Deduplizierung für Shared Completions**

Shared Completions erzeugen zwei Einträge. Im Feed soll nur einer angezeigt werden. In `src/app/(app)/page.tsx`, nach dem `feedEntries`-Array und vor `groupFeedByDay`, füge Deduplizierung hinzu:

```typescript
  // Deduplicate shared completions: keep only the entry where user.id is the current user or the first one
  const seenSharedPairs = new Set<string>()
  const dedupedFeed = feedEntries.filter((entry) => {
    if (entry.type !== 'completion' || !entry.withUser) return true
    const pairKey = [entry.user.id, entry.withUser.id].sort().join('-') + '-' + entry.at.slice(0, 16)
    if (seenSharedPairs.has(pairKey)) return false
    seenSharedPairs.add(pairKey)
    return true
  })

  const feedGroups = groupFeedByDay(dedupedFeed, now)
```

- [ ] **Step 5: Build-Check**

Run: `npx tsc --noEmit`
Expected: Keine Typfehler

- [ ] **Step 6: Commit**

```bash
git add src/lib/dashboard.ts src/components/dashboard/grouped-feed.tsx src/app/(app)/page.tsx
git commit -m "feat: show teamwork completions in feed with partner name"
```

---

### Task 9: Create-Task-Dialog und Task-Verwaltung erweitern

**Files:**
- Modify: `src/components/tasks/create-task-dialog.tsx`
- Modify: `src/components/manage/task-row.tsx`
- Modify: `src/app/(app)/manage/manage-client.tsx`

- [ ] **Step 1: Create-Task-Dialog erweitern**

In `src/components/tasks/create-task-dialog.tsx`, den form-State erweitern (Zeile 22-26):

```typescript
  const [form, setForm] = useState({
    title: '', emoji: '🏠', points: 30,
    categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
    allowMultiple: false, dailyLimit: 3,
  })
```

In der gleichen Datei, nach dem Wiederkehrend-Checkbox-Block (nach Zeile 104, vor `{error && ...}`), füge den Multi-Completion-Block hinzu:

```tsx
          <div className="flex items-center gap-3">
            <input type="checkbox" id="task-multi" checked={form.allowMultiple}
              onChange={(e) => setForm({ ...form, allowMultiple: e.target.checked })} />
            <Label htmlFor="task-multi">Mehrfach pro Tag</Label>
            {form.allowMultiple && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500">Max</span>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  className="w-16"
                  value={form.dailyLimit}
                  onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })}
                />
                <span className="text-sm text-slate-500">×/Tag</span>
              </div>
            )}
          </div>
```

- [ ] **Step 2: Task-Typ in manage-client.tsx erweitern**

In `src/app/(app)/manage/manage-client.tsx`, den Task-Typ erweitern (Zeilen 9-17):

```typescript
type Task = {
  id: string
  title: string
  emoji: string
  points: number
  categoryId: string
  isRecurring: boolean
  recurringInterval: string | null
  status: string
  allowMultiple: boolean
  dailyLimit: number | null
}
```

- [ ] **Step 3: TaskRow Edit-Formular erweitern**

In `src/components/manage/task-row.tsx`, den Task-Typ erweitern (Zeilen 13-22):

```typescript
type Task = {
  id: string
  title: string
  emoji: string
  points: number
  categoryId: string
  isRecurring: boolean
  recurringInterval: string | null
  status: string
  allowMultiple: boolean
  dailyLimit: number | null
}
```

Den form-State erweitern (Zeilen 41-49):

```typescript
  const [form, setForm] = useState({
    title: task.title,
    emoji: task.emoji,
    points: task.points,
    categoryId: task.categoryId,
    isRecurring: task.isRecurring,
    recurringInterval: task.recurringInterval ?? 'weekly',
    status: task.status,
    allowMultiple: task.allowMultiple,
    dailyLimit: task.dailyLimit ?? 3,
  })
```

In der handleSave-Funktion (Zeile 64), den body erweitern:

```typescript
        body: JSON.stringify({
          ...form,
          recurringInterval: form.isRecurring ? form.recurringInterval : null,
          dailyLimit: form.allowMultiple ? form.dailyLimit : null,
        }),
```

Im Edit-Formular JSX, nach dem Wiederkehrend-Block (nach Zeile 181, vor der Button-Reihe), füge hinzu:

```tsx
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`multi-${task.id}`}
            checked={form.allowMultiple}
            onChange={(e) => setForm({ ...form, allowMultiple: e.target.checked })}
          />
          <label htmlFor={`multi-${task.id}`} className="text-sm">Mehrfach pro Tag</label>
          {form.allowMultiple && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Max</span>
              <Input
                type="number"
                min={2}
                max={10}
                className="w-16"
                value={form.dailyLimit}
                onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-500">×/Tag</span>
            </div>
          )}
        </div>
```

- [ ] **Step 4: Manage-Page Query erweitern**

Prüfe `src/app/(app)/manage/page.tsx` — die Tasks-Query muss `allowMultiple` und `dailyLimit` mit selektieren. Falls die Query `select` nutzt, erweitern. Falls sie `findMany` ohne select nutzt, werden die neuen Felder automatisch einbezogen.

- [ ] **Step 5: Build-Check**

Run: `npx tsc --noEmit`
Expected: Keine Typfehler

- [ ] **Step 6: Commit**

```bash
git add src/components/tasks/create-task-dialog.tsx src/components/manage/task-row.tsx src/app/(app)/manage/manage-client.tsx
git commit -m "feat: allowMultiple and dailyLimit in task create/edit UI"
```

---

### Task 10: TaskCard auf Tasks-Seite erweitern

**Files:**
- Modify: `src/components/tasks/task-card.tsx`

- [ ] **Step 1: TaskCard-Typ und Shared-Toggle hinzufügen**

Ersetze den gesamten Inhalt von `src/components/tasks/task-card.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/toast-provider'
import { Check, Users } from 'lucide-react'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
  allowMultiple?: boolean; dailyLimit?: number | null
}

export function TaskCard({ task, onComplete, partnerId, partnerName }: {
  task: Task
  onComplete: (id: string) => Promise<void>
  partnerId?: string
  partnerName?: string
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [shared, setShared] = useState(false)
  const { toast } = useToast()

  async function handleComplete() {
    setLoading(true)
    try {
      const isShared = shared && partnerId
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: isShared ? { 'Content-Type': 'application/json' } : undefined,
        body: isShared ? JSON.stringify({ withUserId: partnerId }) : undefined,
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error ?? 'Fehler beim Erledigen')
      }
      const data = await res.json()
      setDone(true)
      setShared(false)

      const sharedLabel = isShared ? ' 👫' : ''
      toast(`+${data.points} Pkt für "${task.title}"${sharedLabel}`, 'success', {
        label: 'Rückgängig',
        onClick: async () => {
          const undoRes = await fetch(`/api/tasks/${task.id}/complete/undo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completionId: data.id }),
          })
          if (undoRes.ok) {
            setDone(false)
            toast('Erledigung rückgängig gemacht', 'info')
          } else {
            toast('Rückgängig fehlgeschlagen', 'error')
          }
        },
      })

      if (data.newAchievements && data.newAchievements.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(`${a.emoji} Achievement freigeschaltet: ${a.title}`, 'success')
          }, 1500 + i * 1500)
        })
      }

      onComplete(task.id).catch(() => {})
    } catch (err: any) {
      toast(err.message ?? 'Fehler beim Erledigen', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (done) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
      <span className="text-2xl">{task.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{task.title}</p>
        {task.isRecurring && (
          <p className="text-xs text-slate-400">
            🔄 {task.recurringInterval === 'daily' ? 'Täglich'
              : task.recurringInterval === 'weekly' ? 'Wöchentlich'
              : 'Monatlich'}
          </p>
        )}
      </div>
      <Badge variant="secondary" className="text-indigo-700 bg-indigo-50 shrink-0">
        +{task.points} Pkt
      </Badge>
      {partnerId && (
        <button
          onClick={() => setShared(!shared)}
          className={`p-1.5 rounded-lg transition-colors ${
            shared ? 'bg-amber-100 text-amber-700' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
          title={`Zusammen mit ${partnerName}`}
        >
          <Users size={16} />
        </button>
      )}
      <Button size="sm" onClick={handleComplete} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
        {loading ? '…' : <><Check size={16} /> {shared ? '👫 Zusammen' : 'Abhaken'}</>}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: TaskCategoryGroup muss partnerId/partnerName durchreichen**

Prüfe `src/components/tasks/task-category-group.tsx` und passe es an, sodass `partnerId` und `partnerName` an `TaskCard` weitergegeben werden. Falls es diese Props nicht hat, müssen sie hinzugefügt werden (von `tasks-client.tsx` → `TaskCategoryGroup` → `TaskCard`).

- [ ] **Step 3: Build-Check**

Run: `npx tsc --noEmit`
Expected: Keine Typfehler

- [ ] **Step 4: Commit**

```bash
git add src/components/tasks/task-card.tsx src/components/tasks/task-category-group.tsx src/app/(app)/tasks/tasks-client.tsx
git commit -m "feat: teamwork toggle in TaskCard on tasks page"
```

---

### Task 11: Docker-Entrypoint Seed erweitern

**Files:**
- Modify: `scripts/docker-entrypoint.sh`

- [ ] **Step 1: Seed-Script für neue Spalten anpassen**

Die bestehenden INSERT-Statements im Seed-Script verwenden explizite Spaltenlisten. Da `allowMultiple` und `dailyLimit` Defaults haben (false / null), müssen die bestehenden INSERTs nicht geändert werden — SQLite setzt automatisch die Defaults.

Prüfe, dass die existierenden INSERT-Statements für Tasks funktionieren. Da sie explizite Spaltenlisten nutzen (`INSERT OR IGNORE INTO Task (id, title, emoji, points, categoryId, isRecurring, recurringInterval, status, createdById, approvedById, createdAt)`), werden die neuen Spalten mit ihren Defaults befüllt.

Keine Änderung nötig — die Migration setzt Defaults für bestehende und neue Rows.

- [ ] **Step 2: Verifiziere mit einem Trockenlauf**

Run: `npx prisma migrate status`
Expected: Alle Migrationen applied

- [ ] **Step 3: Commit (nur wenn Änderungen nötig waren)**

Falls keine Änderungen nötig: Skip.

---

### Task 12: Alle Tests laufen lassen und Build prüfen

**Files:** Keine neuen Dateien

- [ ] **Step 1: Alle Unit Tests laufen lassen**

Run: `npx vitest run`
Expected: Alle Tests bestehen

- [ ] **Step 2: Produktions-Build prüfen**

Run: `npm run build`
Expected: Build erfolgreich

- [ ] **Step 3: Manuelle Prüfung der neuen Features**

Starte den Dev-Server mit `npm run dev` und prüfe:
1. Task mit `allowMultiple = true` erstellen
2. Task mehrfach abhaken (Zähler prüfen)
3. Task zusammen mit Partner abhaken (👫 Toggle)
4. Feed zeigt Teamwork-Completion korrekt an
5. Undo funktioniert für geteilte Completions

- [ ] **Step 4: Abschluss-Commit falls Fixes nötig waren**

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
