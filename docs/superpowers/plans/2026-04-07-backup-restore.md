# Backup/Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-only feature to export the full database as JSON and restore from a backup file, with automatic pre-restore backup.

**Architecture:** Two new API routes under `/api/settings/backup/` handle export (GET) and restore (POST). A shared `backup.ts` lib module contains the export/import logic. A new `BackupTab` component in the settings page provides the UI with download button, file upload, and confirmation dialog.

**Tech Stack:** Next.js 14 App Router, Prisma 7.6.0 with SQLite, shadcn/ui components, Vitest for testing.

---

### File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/backup.ts` | Export/import logic: `exportAllData()`, `restoreAllData()`, `createPreRestoreBackup()` |
| Create | `src/app/api/settings/backup/route.ts` | `GET` — export JSON download |
| Create | `src/app/api/settings/backup/restore/route.ts` | `POST` — validate, pre-backup, restore |
| Create | `src/app/(app)/settings/tabs/backup-tab.tsx` | UI: export button, import with dialog |
| Modify | `src/app/(app)/settings/settings-client.tsx` | Add backup tab to tab list and render |
| Modify | `src/app/(app)/settings/page.tsx` | Pass `isAdmin` prop to client |
| Create | `src/tests/lib/backup.test.ts` | Unit tests for export/import logic |
| Create | `src/tests/api/backup.test.ts` | API route tests |

---

### Task 1: Backup Library — Export Logic

**Files:**
- Create: `src/lib/backup.ts`
- Create: `src/tests/lib/backup.test.ts`

- [ ] **Step 1: Write failing test for exportAllData**

Create `src/tests/lib/backup.test.ts`:

```typescript
import { vi, describe, it, expect } from 'vitest'

const mockUsers = [
  { id: 'u1', name: 'Alice', pin: '$2a$10$hash', role: 'admin', createdAt: new Date('2026-01-01'), notificationsEnabled: false, installPromptDismissed: false },
]
const mockCategories = [{ id: 'c1', name: 'Küche', emoji: '🍳' }]

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: vi.fn().mockResolvedValue(mockUsers) },
    category: { findMany: vi.fn().mockResolvedValue(mockCategories) },
    task: { findMany: vi.fn().mockResolvedValue([]) },
    taskCompletion: { findMany: vi.fn().mockResolvedValue([]) },
    taskApproval: { findMany: vi.fn().mockResolvedValue([]) },
    storeItem: { findMany: vi.fn().mockResolvedValue([]) },
    purchase: { findMany: vi.fn().mockResolvedValue([]) },
    achievement: { findMany: vi.fn().mockResolvedValue([]) },
    userAchievement: { findMany: vi.fn().mockResolvedValue([]) },
    streakState: { findMany: vi.fn().mockResolvedValue([]) },
    appConfig: { findMany: vi.fn().mockResolvedValue([]) },
    taskScheduleOverride: { findMany: vi.fn().mockResolvedValue([]) },
    pushSubscription: { findMany: vi.fn().mockResolvedValue([]) },
  },
}))

describe('exportAllData', () => {
  it('returns structured backup with meta and all tables', async () => {
    const { exportAllData } = await import('@/lib/backup')
    const result = await exportAllData()

    expect(result.meta).toBeDefined()
    expect(result.meta.version).toBe(1)
    expect(result.meta.exportedAt).toBeDefined()
    expect(result.data.users).toEqual(mockUsers)
    expect(result.data.categories).toEqual(mockCategories)
    expect(result.data.tasks).toEqual([])
    expect(result.data.taskCompletions).toEqual([])
    expect(result.data.taskApprovals).toEqual([])
    expect(result.data.storeItems).toEqual([])
    expect(result.data.purchases).toEqual([])
    expect(result.data.achievements).toEqual([])
    expect(result.data.userAchievements).toEqual([])
    expect(result.data.streakStates).toEqual([])
    expect(result.data.appConfigs).toEqual([])
    expect(result.data.taskScheduleOverrides).toEqual([])
    expect(result.data.pushSubscriptions).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: FAIL — module `@/lib/backup` not found

- [ ] **Step 3: Implement exportAllData**

Create `src/lib/backup.ts`:

```typescript
import { prisma } from '@/lib/prisma'

export const BACKUP_VERSION = 1

export type BackupData = {
  meta: {
    version: number
    exportedAt: string
    appVersion: string
  }
  data: {
    users: unknown[]
    categories: unknown[]
    tasks: unknown[]
    taskCompletions: unknown[]
    taskApprovals: unknown[]
    storeItems: unknown[]
    purchases: unknown[]
    achievements: unknown[]
    userAchievements: unknown[]
    streakStates: unknown[]
    appConfigs: unknown[]
    taskScheduleOverrides: unknown[]
    pushSubscriptions: unknown[]
  }
}

const EXPECTED_TABLES = [
  'users', 'categories', 'tasks', 'taskCompletions', 'taskApprovals',
  'storeItems', 'purchases', 'achievements', 'userAchievements',
  'streakStates', 'appConfigs', 'taskScheduleOverrides', 'pushSubscriptions',
] as const

export async function exportAllData(): Promise<BackupData> {
  const [
    users, categories, tasks, taskCompletions, taskApprovals,
    storeItems, purchases, achievements, userAchievements,
    streakStates, appConfigs, taskScheduleOverrides, pushSubscriptions,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.task.findMany(),
    prisma.taskCompletion.findMany(),
    prisma.taskApproval.findMany(),
    prisma.storeItem.findMany(),
    prisma.purchase.findMany(),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany(),
    prisma.streakState.findMany(),
    prisma.appConfig.findMany(),
    prisma.taskScheduleOverride.findMany(),
    prisma.pushSubscription.findMany(),
  ])

  return {
    meta: {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    },
    data: {
      users, categories, tasks, taskCompletions, taskApprovals,
      storeItems, purchases, achievements, userAchievements,
      streakStates, appConfigs, taskScheduleOverrides, pushSubscriptions,
    },
  }
}

export function validateBackup(data: unknown): { valid: true; backup: BackupData } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Ungültiges JSON-Format' }
  }

  const backup = data as Record<string, unknown>

  if (!backup.meta || typeof backup.meta !== 'object') {
    return { valid: false, error: 'Meta-Daten fehlen' }
  }

  const meta = backup.meta as Record<string, unknown>
  if (meta.version !== BACKUP_VERSION) {
    return { valid: false, error: `Inkompatible Version: ${meta.version} (erwartet: ${BACKUP_VERSION})` }
  }

  if (!backup.data || typeof backup.data !== 'object') {
    return { valid: false, error: 'Daten-Objekt fehlt' }
  }

  const dataObj = backup.data as Record<string, unknown>
  for (const table of EXPECTED_TABLES) {
    if (!Array.isArray(dataObj[table])) {
      return { valid: false, error: `Tabelle "${table}" fehlt oder ist kein Array` }
    }
  }

  return { valid: true, backup: data as BackupData }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/backup.ts src/tests/lib/backup.test.ts
git commit -m "feat(backup): add exportAllData and validateBackup"
```

---

### Task 2: Backup Library — Validation Tests

**Files:**
- Modify: `src/tests/lib/backup.test.ts`

- [ ] **Step 1: Add validation tests**

Append to `src/tests/lib/backup.test.ts`:

```typescript
describe('validateBackup', () => {
  it('accepts valid backup data', async () => {
    const { validateBackup, exportAllData } = await import('@/lib/backup')
    const backup = await exportAllData()
    const result = validateBackup(backup)
    expect(result.valid).toBe(true)
  })

  it('rejects null input', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup(null)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('Ungültiges JSON')
  })

  it('rejects missing meta', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup({ data: {} })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('Meta-Daten')
  })

  it('rejects wrong version', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup({ meta: { version: 999 }, data: {} })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('Inkompatible Version')
  })

  it('rejects missing table', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup({
      meta: { version: 1, exportedAt: '', appVersion: '1.0.0' },
      data: { users: [] },
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('fehlt')
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: all PASS

- [ ] **Step 3: Commit**

```bash
git add src/tests/lib/backup.test.ts
git commit -m "test(backup): add validation tests"
```

---

### Task 3: Backup Library — Restore Logic

**Files:**
- Modify: `src/lib/backup.ts`
- Modify: `src/tests/lib/backup.test.ts`

- [ ] **Step 1: Write failing test for restoreAllData**

Append to `src/tests/lib/backup.test.ts` (add new mocks at the top-level mock block):

Update the `vi.mock('@/lib/prisma')` block to add `deleteMany` and `createMany` mocks for all models, plus `$transaction`:

```typescript
// Replace the existing prisma mock with this expanded version:
vi.mock('@/lib/prisma', () => {
  const makeModel = (data: unknown[] = []) => ({
    findMany: vi.fn().mockResolvedValue(data),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
  })

  return {
    prisma: {
      user: makeModel(mockUsers),
      category: makeModel(mockCategories),
      task: makeModel(),
      taskCompletion: makeModel(),
      taskApproval: makeModel(),
      storeItem: makeModel(),
      purchase: makeModel(),
      achievement: makeModel(),
      userAchievement: makeModel(),
      streakState: makeModel(),
      appConfig: makeModel(),
      taskScheduleOverride: makeModel(),
      pushSubscription: makeModel(),
      $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
        const { prisma } = await import('@/lib/prisma')
        return fn(prisma)
      }),
    },
  }
})
```

Then add the test:

```typescript
describe('restoreAllData', () => {
  it('calls deleteMany and createMany in transaction', async () => {
    const { restoreAllData } = await import('@/lib/backup')
    const { prisma } = await import('@/lib/prisma')

    const backup: BackupData = {
      meta: { version: 1, exportedAt: '2026-04-07T00:00:00Z', appVersion: '1.0.0' },
      data: {
        users: [{ id: 'u1', name: 'Alice', pin: '$2a$10$hash', role: 'admin', createdAt: '2026-01-01T00:00:00Z', notificationsEnabled: false, installPromptDismissed: false }],
        categories: [], tasks: [], taskCompletions: [], taskApprovals: [],
        storeItems: [], purchases: [], achievements: [], userAchievements: [],
        streakStates: [], appConfigs: [], taskScheduleOverrides: [], pushSubscriptions: [],
      },
    }

    await restoreAllData(backup)

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.user.deleteMany).toHaveBeenCalled()
    expect(prisma.user.createMany).toHaveBeenCalledWith({ data: backup.data.users })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: FAIL — `restoreAllData` not exported

- [ ] **Step 3: Implement restoreAllData**

Add to `src/lib/backup.ts`:

```typescript
export async function restoreAllData(backup: BackupData): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Delete in reverse dependency order
    await tx.pushSubscription.deleteMany()
    await tx.userAchievement.deleteMany()
    await tx.taskScheduleOverride.deleteMany()
    await tx.taskCompletion.deleteMany()
    await tx.taskApproval.deleteMany()
    await tx.purchase.deleteMany()
    await tx.streakState.deleteMany()
    await tx.task.deleteMany()
    await tx.storeItem.deleteMany()
    await tx.achievement.deleteMany()
    await tx.category.deleteMany()
    await tx.appConfig.deleteMany()
    await tx.user.deleteMany()

    // Insert in dependency order
    if (backup.data.users.length) await tx.user.createMany({ data: backup.data.users as any })
    if (backup.data.categories.length) await tx.category.createMany({ data: backup.data.categories as any })
    if (backup.data.appConfigs.length) await tx.appConfig.createMany({ data: backup.data.appConfigs as any })
    if (backup.data.achievements.length) await tx.achievement.createMany({ data: backup.data.achievements as any })
    if (backup.data.storeItems.length) await tx.storeItem.createMany({ data: backup.data.storeItems as any })
    if (backup.data.tasks.length) await tx.task.createMany({ data: backup.data.tasks as any })
    if (backup.data.taskCompletions.length) await tx.taskCompletion.createMany({ data: backup.data.taskCompletions as any })
    if (backup.data.taskApprovals.length) await tx.taskApproval.createMany({ data: backup.data.taskApprovals as any })
    if (backup.data.purchases.length) await tx.purchase.createMany({ data: backup.data.purchases as any })
    if (backup.data.streakStates.length) await tx.streakState.createMany({ data: backup.data.streakStates as any })
    if (backup.data.userAchievements.length) await tx.userAchievement.createMany({ data: backup.data.userAchievements as any })
    if (backup.data.taskScheduleOverrides.length) await tx.taskScheduleOverride.createMany({ data: backup.data.taskScheduleOverrides as any })
    if (backup.data.pushSubscriptions.length) await tx.pushSubscription.createMany({ data: backup.data.pushSubscriptions as any })
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/backup.ts src/tests/lib/backup.test.ts
git commit -m "feat(backup): add restoreAllData with transactional delete+insert"
```

---

### Task 4: Backup Library — Pre-Restore Backup

**Files:**
- Modify: `src/lib/backup.ts`
- Modify: `src/tests/lib/backup.test.ts`

- [ ] **Step 1: Write failing test for createPreRestoreBackup**

Append to `src/tests/lib/backup.test.ts`:

```typescript
import { vol } from 'memfs'

vi.mock('fs/promises', async () => {
  const memfs = await import('memfs')
  return memfs.fs.promises
})

describe('createPreRestoreBackup', () => {
  it('writes backup JSON to /app/data/backups/', async () => {
    vol.reset()
    const { createPreRestoreBackup } = await import('@/lib/backup')
    const path = await createPreRestoreBackup()

    expect(path).toMatch(/\/app\/data\/backups\/pre-restore-.*\.json$/)

    const { fs } = await import('memfs')
    const content = fs.readFileSync(path, 'utf-8') as string
    const parsed = JSON.parse(content)
    expect(parsed.meta.version).toBe(1)
  })
})
```

Note: Install `memfs` if not already available: `npm install -D memfs`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: FAIL — `createPreRestoreBackup` not exported

- [ ] **Step 3: Implement createPreRestoreBackup**

Add to `src/lib/backup.ts`:

```typescript
import { mkdir, writeFile, readdir, unlink } from 'fs/promises'
import { join } from 'path'

const BACKUP_DIR = process.env.BACKUP_DIR || '/app/data/backups'
const MAX_PRE_RESTORE_BACKUPS = 5

export async function createPreRestoreBackup(): Promise<string> {
  await mkdir(BACKUP_DIR, { recursive: true })

  const backup = await exportAllData()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `pre-restore-${timestamp}.json`
  const filepath = join(BACKUP_DIR, filename)

  await writeFile(filepath, JSON.stringify(backup, null, 2), 'utf-8')

  // Clean up old backups, keep only MAX_PRE_RESTORE_BACKUPS
  const files = (await readdir(BACKUP_DIR))
    .filter((f) => f.startsWith('pre-restore-') && f.endsWith('.json'))
    .sort()

  while (files.length > MAX_PRE_RESTORE_BACKUPS) {
    const oldest = files.shift()!
    await unlink(join(BACKUP_DIR, oldest))
  }

  return filepath
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/lib/backup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/backup.ts src/tests/lib/backup.test.ts
git commit -m "feat(backup): add createPreRestoreBackup with cleanup"
```

---

### Task 5: Export API Route

**Files:**
- Create: `src/app/api/settings/backup/route.ts`
- Create: `src/tests/api/backup.test.ts`

- [ ] **Step 1: Write failing test for GET /api/settings/backup**

Create `src/tests/api/backup.test.ts`:

```typescript
import { vi, describe, it, expect } from 'vitest'

const mockBackup = {
  meta: { version: 1, exportedAt: '2026-04-07T00:00:00Z', appVersion: '1.0.0' },
  data: {
    users: [], categories: [], tasks: [], taskCompletions: [], taskApprovals: [],
    storeItems: [], purchases: [], achievements: [], userAchievements: [],
    streakStates: [], appConfigs: [], taskScheduleOverrides: [], pushSubscriptions: [],
  },
}

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'admin' } }),
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/backup', () => ({
  exportAllData: vi.fn().mockResolvedValue(mockBackup),
}))

describe('GET /api/settings/backup', () => {
  it('returns 200 with backup JSON and content-disposition header', async () => {
    const { GET } = await import('@/app/api/settings/backup/route')
    const res = await GET()

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.meta.version).toBe(1)
    expect(res.headers.get('Content-Disposition')).toMatch(/attachment.*haushalt-quest-backup.*\.json/)
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const { GET } = await import('@/app/api/settings/backup/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { id: 'u2', name: 'Bob', role: 'member' } } as any)

    const { GET } = await import('@/app/api/settings/backup/route')
    const res = await GET()
    expect(res.status).toBe(403)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/api/backup.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement GET route**

Create `src/app/api/settings/backup/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { exportAllData } from '@/lib/backup'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const backup = await exportAllData()
  const date = new Date().toISOString().split('T')[0]

  return NextResponse.json(backup, {
    headers: {
      'Content-Disposition': `attachment; filename="haushalt-quest-backup-${date}.json"`,
    },
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/api/backup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/settings/backup/route.ts src/tests/api/backup.test.ts
git commit -m "feat(backup): add GET /api/settings/backup export endpoint"
```

---

### Task 6: Restore API Route

**Files:**
- Create: `src/app/api/settings/backup/restore/route.ts`
- Modify: `src/tests/api/backup.test.ts`

- [ ] **Step 1: Write failing tests for POST /api/settings/backup/restore**

Append to `src/tests/api/backup.test.ts`:

```typescript
vi.mock('@/lib/backup', async () => {
  return {
    exportAllData: vi.fn().mockResolvedValue(mockBackup),
    validateBackup: (await import('@/lib/backup')).validateBackup,
    restoreAllData: vi.fn().mockResolvedValue(undefined),
    createPreRestoreBackup: vi.fn().mockResolvedValue('/app/data/backups/pre-restore-test.json'),
  }
})
```

Note: the mock block above needs to **replace** the earlier `@/lib/backup` mock. Restructure the file so both describe blocks share the same mock. Alternatively, use `vi.hoisted` to define the mocks and import the real `validateBackup`:

```typescript
describe('POST /api/settings/backup/restore', () => {
  it('returns 200 on valid restore', async () => {
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBackup),
      })
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('returns 400 for invalid JSON', async () => {
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        body: 'not json',
      })
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid backup structure', async () => {
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: { version: 999 }, data: {} }),
      })
    )
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBackup),
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { id: 'u2', name: 'Bob', role: 'member' } } as any)

    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBackup),
      })
    )
    expect(res.status).toBe(403)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/api/backup.test.ts`
Expected: FAIL — restore route module not found

- [ ] **Step 3: Implement POST restore route**

Create `src/app/api/settings/backup/restore/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { validateBackup, restoreAllData, createPreRestoreBackup } from '@/lib/backup'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 })
  }

  const validation = validateBackup(body)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    await createPreRestoreBackup()
  } catch (err) {
    return NextResponse.json({ error: 'Pre-Restore-Backup fehlgeschlagen' }, { status: 500 })
  }

  try {
    await restoreAllData(validation.backup)
  } catch (err) {
    return NextResponse.json({ error: 'Restore fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Configure body size limit for restore route**

Add to `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
```

Note: Next.js 14 App Router route handlers respect the `bodySizeLimit` config. If this doesn't work for route handlers specifically, an alternative is to use `export const config = { api: { bodyParser: { sizeLimit: '5mb' } } }` in the route file — but test first.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/tests/api/backup.test.ts`
Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/settings/backup/restore/route.ts next.config.mjs src/tests/api/backup.test.ts
git commit -m "feat(backup): add POST /api/settings/backup/restore endpoint"
```

---

### Task 7: Backup Tab UI Component

**Files:**
- Create: `src/app/(app)/settings/tabs/backup-tab.tsx`

- [ ] **Step 1: Create the BackupTab component**

Create `src/app/(app)/settings/tabs/backup-tab.tsx`:

```typescript
'use client'
import { useState, useRef } from 'react'
import { useToast } from '@/components/toast-provider'
import { Download, Upload, AlertTriangle } from 'lucide-react'

export function BackupTab() {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ name: string; exportedAt: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingFileRef = useRef<string | null>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/settings/backup')
      if (!res.ok) throw new Error('Export fehlgeschlagen')

      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `haushalt-quest-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Backup heruntergeladen', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export fehlgeschlagen', 'error')
    } finally {
      setExporting(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const content = reader.result as string
        const parsed = JSON.parse(content)
        if (!parsed.meta?.exportedAt) throw new Error('Ungültige Backup-Datei')

        pendingFileRef.current = content
        setFileInfo({
          name: file.name,
          exportedAt: new Date(parsed.meta.exportedAt).toLocaleString('de-DE'),
        })
        setShowConfirm(true)
      } catch {
        toast('Ungültige Backup-Datei', 'error')
      }
    }
    reader.readAsText(file)

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  async function handleRestore() {
    if (!pendingFileRef.current) return
    setShowConfirm(false)
    setRestoring(true)

    try {
      const res = await fetch('/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: pendingFileRef.current,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Restore fehlgeschlagen')
      }

      toast('Daten wiederhergestellt. Seite wird neu geladen.', 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Restore fehlgeschlagen', 'error')
    } finally {
      setRestoring(false)
      pendingFileRef.current = null
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Exportiere alle Daten als JSON-Datei oder stelle sie aus einem Backup wieder her.
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || restoring}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          {exporting ? 'Exportiert...' : 'Backup exportieren'}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={exporting || restoring}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={16} />
          {restoring ? 'Wiederherstellen...' : 'Backup wiederherstellen'}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && fileInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="font-semibold text-lg text-slate-800">Daten überschreiben?</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Alle aktuellen Daten werden überschrieben. Ein automatisches Backup wird vorher erstellt.</p>
              <p className="text-xs text-slate-400">
                Datei: {fileInfo.name}<br />
                Exportiert am: {fileInfo.exportedAt}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  pendingFileRef.current = null
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Wiederherstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to backup-tab

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/tabs/backup-tab.tsx
git commit -m "feat(backup): add BackupTab UI component"
```

---

### Task 8: Integrate BackupTab into Settings

**Files:**
- Modify: `src/app/(app)/settings/settings-client.tsx`
- Modify: `src/app/(app)/settings/page.tsx`

- [ ] **Step 1: Add BackupTab import and tab entry to settings-client.tsx**

In `src/app/(app)/settings/settings-client.tsx`, add the import:

```typescript
import { BackupTab } from './tabs/backup-tab'
```

Add to the TABS array (at the end, before the `as const`):

```typescript
  { key: 'backup', label: 'Backup' },
```

Add `isAdmin` to the component props:

```typescript
  isAdmin: boolean
```

Add the tab render (after the notifications conditional):

```typescript
      {tab === 'backup' && isAdmin && <BackupTab />}
```

Filter the backup tab visibility — update the tab buttons to conditionally show:

```typescript
        {TABS.filter((t) => t.key !== 'backup' || isAdmin).map((t) => (
```

- [ ] **Step 2: Pass isAdmin from page.tsx**

In `src/app/(app)/settings/page.tsx`, the server component already has access to the session. Add `isAdmin` prop:

Find where `<SettingsClient` is rendered and add:

```typescript
isAdmin={currentUser?.role === 'admin'}
```

Note: Check how `currentUser` is fetched — it likely already has the role from the session. The exact prop passing depends on the current code structure.

- [ ] **Step 3: Verify the app builds**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/settings/settings-client.tsx src/app/\(app\)/settings/page.tsx
git commit -m "feat(backup): integrate BackupTab into settings page"
```

---

### Task 9: Manual E2E Verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify export works**

1. Log in as admin
2. Go to Settings → Backup tab
3. Click "Backup exportieren"
4. Verify JSON file downloads with all tables populated

- [ ] **Step 3: Verify restore works**

1. Click "Backup wiederherstellen"
2. Select the exported JSON file
3. Verify confirmation dialog shows export date
4. Click "Wiederherstellen"
5. Verify success toast and page reload
6. Verify data is intact after reload

- [ ] **Step 4: Verify pre-restore backup was created**

Check: `ls data/backups/` (or `/app/data/backups/` in Docker)
Expected: `pre-restore-*.json` file exists

- [ ] **Step 5: Verify non-admin cannot access**

1. Log in as member or child
2. Go to Settings
3. Verify "Backup" tab is not visible

- [ ] **Step 6: Commit final state**

```bash
git add -A
git commit -m "feat(backup): complete backup/restore feature"
```
