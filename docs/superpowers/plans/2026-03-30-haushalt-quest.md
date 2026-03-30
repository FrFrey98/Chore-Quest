# Haushalt-Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a gamified household task management web app for two users, deployable via Docker on a Raspberry Pi in the home network.

**Architecture:** Next.js 14 App Router for frontend and API routes in one process. Prisma + SQLite as a single-file database. NextAuth.js with Credentials provider for PIN-based auth. Pure logic functions in `src/lib/` are unit-tested with Vitest; API routes and UI components are covered by integration tests.

**Tech Stack:** Next.js 14, Prisma 5, SQLite, NextAuth.js 4, bcryptjs, Tailwind CSS, shadcn/ui, Recharts, Vitest, Docker

---

## File Map

```
haushalt-quest/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── vitest.config.ts
├── src/
│   ├── middleware.ts
│   ├── types/
│   │   └── next-auth.d.ts         # extend Session/JWT types
│   ├── lib/
│   │   ├── prisma.ts              # Prisma singleton
│   │   ├── auth.ts                # NextAuth authOptions
│   │   ├── points.ts              # pure point calculation functions
│   │   └── recurring.ts          # pure recurring-task date functions
│   ├── app/
│   │   ├── layout.tsx             # root layout (providers)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx       # PIN login page
│   │   ├── (app)/
│   │   │   ├── layout.tsx         # app shell with navigation
│   │   │   ├── page.tsx           # dashboard (feed)
│   │   │   ├── tasks/page.tsx
│   │   │   ├── store/page.tsx
│   │   │   ├── stats/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   └── admin/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── tasks/
│   │       │   ├── route.ts             # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts         # PATCH (edit), DELETE
│   │       │       └── complete/route.ts # POST (mark done)
│   │       ├── approvals/
│   │       │   └── [id]/route.ts        # POST (approve/reject)
│   │       ├── store/
│   │       │   ├── route.ts             # GET (list), POST (admin: create)
│   │       │   └── [id]/
│   │       │       ├── purchase/route.ts # POST
│   │       │       └── redeem/route.ts   # POST
│   │       ├── feed/route.ts            # GET (activity feed)
│   │       └── stats/route.ts           # GET (?tab=personal|comparison&from=&to=)
│   ├── components/
│   │   ├── nav/
│   │   │   └── navigation.tsx
│   │   ├── dashboard/
│   │   │   ├── points-header.tsx
│   │   │   └── feed-item.tsx
│   │   ├── tasks/
│   │   │   ├── task-card.tsx
│   │   │   └── task-category-group.tsx
│   │   ├── store/
│   │   │   └── store-item-card.tsx
│   │   ├── stats/
│   │   │   ├── heatmap.tsx
│   │   │   ├── comparison-chart.tsx
│   │   │   └── category-pie-chart.tsx
│   │   └── approvals/
│   │       └── approval-card.tsx
│   └── tests/
│       ├── setup.ts
│       ├── lib/
│       │   ├── points.test.ts
│       │   └── recurring.test.ts
│       └── api/
│           ├── tasks.test.ts
│           ├── approvals.test.ts
│           ├── store.test.ts
│           └── stats.test.ts
```

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `haushalt-quest/` (project root)
- Create: `vitest.config.ts`
- Create: `src/tests/setup.ts`

- [ ] **Step 1: Create Next.js app**

```bash
npx create-next-app@14 haushalt-quest \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --no-eslint
cd haushalt-quest
```

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client next-auth bcryptjs recharts
npm install -D @types/bcryptjs vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom \
  @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn-ui@latest init
# Wähle: Default style, Slate color, CSS variables yes
npx shadcn-ui@latest add button card badge tabs input label dialog
```

- [ ] **Step 4: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
})
```

- [ ] **Step 5: Write `src/tests/setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 7: Verify setup**

```bash
npm test
```

Expected: 0 tests found, exits 0 (no failures).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Vitest and shadcn/ui"
```

---

### Task 2: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `.env.example`
- Modify: `package.json`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Write `.env` (lokal, nicht committen)**

```bash
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="local-dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
EOF
```

- [ ] **Step 3: Write `.env.example`**

```
DATABASE_URL="file:/app/data/haushalts.db"
NEXTAUTH_SECRET="replace-with-random-string"
NEXTAUTH_URL="http://<raspberry-pi-ip>:3000"
```

- [ ] **Step 4: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  name        String
  pin         String
  createdAt   DateTime @default(now())

  completions   TaskCompletion[]
  purchases     Purchase[]
  createdTasks  Task[]           @relation("CreatedBy")
  approvedTasks Task[]           @relation("ApprovedBy")
  approvals     TaskApproval[]
}

model Category {
  id    String @id @default(cuid())
  name  String
  emoji String
  tasks Task[]
}

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

  category    Category         @relation(fields: [categoryId], references: [id])
  createdBy   User             @relation("CreatedBy", fields: [createdById], references: [id])
  approvedBy  User?            @relation("ApprovedBy", fields: [approvedById], references: [id])
  completions TaskCompletion[]
  approval    TaskApproval?
}

model TaskApproval {
  id            String   @id @default(cuid())
  taskId        String   @unique
  requestedById String
  status        String   @default("pending")
  createdAt     DateTime @default(now())

  task        Task @relation(fields: [taskId], references: [id])
  requestedBy User @relation(fields: [requestedById], references: [id])
}

model TaskCompletion {
  id          String   @id @default(cuid())
  taskId      String
  userId      String
  points      Int
  completedAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

model StoreItem {
  id          String   @id @default(cuid())
  title       String
  description String
  emoji       String
  pointCost   Int
  type        String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  purchases Purchase[]
}

model Purchase {
  id          String    @id @default(cuid())
  itemId      String
  userId      String
  pointsSpent Int
  purchasedAt DateTime  @default(now())
  redeemedAt  DateTime?

  item StoreItem @relation(fields: [itemId], references: [id])
  user User      @relation(fields: [userId], references: [id])
}
```

- [ ] **Step 5: Write `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const pin1 = await bcrypt.hash('1234', 10)
  const pin2 = await bcrypt.hash('5678', 10)

  await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: { id: 'user-1', name: 'Franz', pin: pin1 },
  })

  await prisma.user.upsert({
    where: { id: 'user-2' },
    update: {},
    create: { id: 'user-2', name: 'Partner', pin: pin2 },
  })

  for (const cat of [
    { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
    { id: 'cat-bath', name: 'Bad', emoji: '🚿' },
    { id: 'cat-general', name: 'Allgemein', emoji: '🏠' },
  ]) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 6: Add seed config to `package.json`**

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 7: Run migration and seed**

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Expected: Migration applied, two users and three categories created.

- [ ] **Step 8: Commit**

```bash
git add prisma/ .env.example
git commit -m "feat: add Prisma schema and seed data"
```

---

### Task 3: Prisma Singleton & Type Extensions

**Files:**
- Create: `src/lib/prisma.ts`
- Create: `src/types/next-auth.d.ts`

- [ ] **Step 1: Write `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Write `src/types/next-auth.d.ts`**

```typescript
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
    }
  }
  interface User {
    id: string
    name: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/prisma.ts src/types/
git commit -m "feat: add Prisma singleton and NextAuth type extensions"
```

---

### Task 4: Points Calculation Logic (TDD)

**Files:**
- Create: `src/lib/points.ts`
- Create: `src/tests/lib/points.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/tests/lib/points.test.ts
import { describe, it, expect } from 'vitest'
import {
  getCurrentPoints,
  getTotalEarned,
  getLevel,
  LEVELS,
} from '@/lib/points'

describe('getCurrentPoints', () => {
  it('returns earned minus spent', () => {
    expect(getCurrentPoints(500, 200)).toBe(300)
  })

  it('returns 0 when spent equals earned', () => {
    expect(getCurrentPoints(300, 300)).toBe(0)
  })

  it('never returns negative', () => {
    expect(getCurrentPoints(100, 200)).toBe(0)
  })
})

describe('getTotalEarned', () => {
  it('sums completion points', () => {
    const completions = [{ points: 50 }, { points: 80 }, { points: 30 }]
    expect(getTotalEarned(completions)).toBe(160)
  })

  it('returns 0 for empty array', () => {
    expect(getTotalEarned([])).toBe(0)
  })
})

describe('getLevel', () => {
  it('returns level 1 at 0 points', () => {
    expect(getLevel(0).level).toBe(1)
  })

  it('returns level 2 at 200 points', () => {
    expect(getLevel(200).level).toBe(2)
  })

  it('returns level 6 at 4000 points', () => {
    expect(getLevel(4000).level).toBe(6)
  })

  it('returns max level for very high points', () => {
    expect(getLevel(99999).level).toBe(LEVELS.length)
  })

  it('returns correct title', () => {
    expect(getLevel(0).title).toBe('Haushaltslehrling')
    expect(getLevel(500).title).toBe('Putz-Profi')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test src/tests/lib/points.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/points'`

- [ ] **Step 3: Write `src/lib/points.ts`**

```typescript
export const LEVELS = [
  { level: 1, minPoints: 0,    title: 'Haushaltslehrling' },
  { level: 2, minPoints: 200,  title: 'Ordnungs-Fan' },
  { level: 3, minPoints: 500,  title: 'Putz-Profi' },
  { level: 4, minPoints: 1000, title: 'Haushalts-Held' },
  { level: 5, minPoints: 2000, title: 'Hygiene-Legende' },
  { level: 6, minPoints: 4000, title: 'Wohn-Meister' },
]

export function getCurrentPoints(earned: number, spent: number): number {
  return Math.max(0, earned - spent)
}

export function getTotalEarned(completions: { points: number }[]): number {
  return completions.reduce((sum, c) => sum + c.points, 0)
}

export function getLevel(totalEarned: number): { level: number; title: string; minPoints: number } {
  const current = [...LEVELS]
    .reverse()
    .find((l) => totalEarned >= l.minPoints)
  return current ?? LEVELS[0]
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test src/tests/lib/points.test.ts
```

Expected: 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/points.ts src/tests/lib/points.test.ts
git commit -m "feat: add points calculation logic with tests"
```

---

### Task 5: Recurring Task Logic (TDD)

**Files:**
- Create: `src/lib/recurring.ts`
- Create: `src/tests/lib/recurring.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/tests/lib/recurring.test.ts
import { describe, it, expect } from 'vitest'
import { getNextDueAt, isTaskVisible } from '@/lib/recurring'

describe('getNextDueAt', () => {
  const base = new Date('2026-04-01T10:00:00Z')

  it('adds 1 day for daily', () => {
    const next = getNextDueAt('daily', base)
    expect(next.toISOString()).toBe('2026-04-02T10:00:00.000Z')
  })

  it('adds 7 days for weekly', () => {
    const next = getNextDueAt('weekly', base)
    expect(next.toISOString()).toBe('2026-04-08T10:00:00.000Z')
  })

  it('adds 30 days for monthly', () => {
    const next = getNextDueAt('monthly', base)
    expect(next.toISOString()).toBe('2026-05-01T10:00:00.000Z')
  })
})

describe('isTaskVisible', () => {
  const now = new Date('2026-04-05T12:00:00Z')

  it('shows one-time tasks without nextDueAt', () => {
    expect(isTaskVisible({ isRecurring: false, nextDueAt: null }, now)).toBe(true)
  })

  it('shows recurring tasks when nextDueAt is in the past', () => {
    const past = new Date('2026-04-04T00:00:00Z')
    expect(isTaskVisible({ isRecurring: true, nextDueAt: past }, now)).toBe(true)
  })

  it('hides recurring tasks when nextDueAt is in the future', () => {
    const future = new Date('2026-04-10T00:00:00Z')
    expect(isTaskVisible({ isRecurring: true, nextDueAt: future }, now)).toBe(false)
  })

  it('shows recurring tasks without nextDueAt (never completed)', () => {
    expect(isTaskVisible({ isRecurring: true, nextDueAt: null }, now)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test src/tests/lib/recurring.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/recurring'`

- [ ] **Step 3: Write `src/lib/recurring.ts`**

```typescript
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test src/tests/lib/recurring.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/recurring.ts src/tests/lib/recurring.test.ts
git commit -m "feat: add recurring task logic with tests"
```

---

### Task 6: Authentication

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Write `src/lib/auth.ts`**

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'PIN',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        pin: { label: 'PIN', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.pin) return null

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.pin, user.pin)
        if (!valid) return null

        return { id: user.id, name: user.name }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
}
```

- [ ] **Step 2: Write `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 3: Write `src/middleware.ts`**

```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 4: Verify dev server starts without errors**

```bash
npm run dev
```

Open `http://localhost:3000` — expect redirect to `/login`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts
git commit -m "feat: add NextAuth PIN authentication and route protection"
```

---

### Task 7: Login Page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Write root `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Haushalt-Quest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Write `src/components/providers.tsx`**

```tsx
'use client'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Step 3: Fetch users for login page via server action in `src/app/(auth)/login/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  })
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">🏠 Haushalt-Quest</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Wer bist du?</p>
        <LoginForm users={users} />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Write `src/app/(auth)/login/login-form.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type User = { id: string; name: string }

export function LoginForm({ users }: { users: User[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      userId: selectedId,
      pin,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Falscher PIN. Nochmal versuchen.')
    } else {
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {users.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setSelectedId(u.id)}
            className={`p-4 rounded-xl border-2 text-center font-medium transition-colors ${
              selectedId === u.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {u.name}
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="space-y-2">
          <Input
            type="password"
            inputMode="numeric"
            placeholder="PIN eingeben"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={8}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !pin}>
            {loading ? 'Prüfe…' : 'Einloggen'}
          </Button>
        </div>
      )}
    </form>
  )
}
```

- [ ] **Step 5: Test login manually**

```bash
npm run dev
```

Open `http://localhost:3000/login`, wähle einen Nutzer, gib PIN `1234` bzw. `5678` ein.
Expected: Redirect auf `/` (noch leer, aber kein Fehler).

- [ ] **Step 6: Commit**

```bash
git add src/app/ src/components/providers.tsx
git commit -m "feat: add PIN login page"
```

---

### Task 8: API — Tasks

**Files:**
- Create: `src/app/api/tasks/route.ts`
- Create: `src/app/api/tasks/[id]/route.ts`
- Create: `src/app/api/tasks/[id]/complete/route.ts`
- Create: `src/tests/api/tasks.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/tests/api/tasks.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockSession = { user: { id: 'user-1', name: 'Franz' } }
const mockTask = {
  id: 'task-1',
  title: 'Abwasch',
  emoji: '🍽️',
  points: 30,
  isRecurring: false,
  recurringInterval: null,
  status: 'active',
  categoryId: 'cat-kitchen',
  createdById: 'user-1',
  nextDueAt: null,
  category: { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
}

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue(mockSession),
}))

vi.mock('@/lib/auth', () => ({ authOptions: {} }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: vi.fn().mockResolvedValue([mockTask]),
      create: vi.fn().mockResolvedValue(mockTask),
    },
    taskApproval: {
      create: vi.fn().mockResolvedValue({ id: 'approval-1' }),
    },
    taskCompletion: {
      create: vi.fn().mockResolvedValue({ id: 'comp-1', points: 30 }),
    },
    task: {
      findMany: vi.fn().mockResolvedValue([mockTask]),
      create: vi.fn().mockResolvedValue(mockTask),
      findUnique: vi.fn().mockResolvedValue(mockTask),
      update: vi.fn().mockResolvedValue({ ...mockTask, status: 'archived' }),
    },
  },
}))

describe('GET /api/tasks', () => {
  it('returns 200 with task list', async () => {
    const { GET } = await import('@/app/api/tasks/route')
    const req = new Request('http://localhost/api/tasks')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/tasks', () => {
  it('returns 201 when task is created', async () => {
    const { POST } = await import('@/app/api/tasks/route')
    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Abwasch',
        emoji: '🍽️',
        points: 30,
        categoryId: 'cat-kitchen',
        isRecurring: false,
      }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test src/tests/api/tasks.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/app/api/tasks/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const tasks = await prisma.task.findMany({
    where: { status: 'active' },
    include: { category: true, createdBy: { select: { id: true, name: true } } },
    orderBy: { points: 'desc' },
  })

  // Filter recurring tasks by nextDueAt
  const visible = tasks.filter(
    (t) => !t.isRecurring || !t.nextDueAt || t.nextDueAt <= now
  )

  return NextResponse.json(visible)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, emoji, points, categoryId, isRecurring, recurringInterval } = body

  if (!title || !emoji || !points || !categoryId) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title,
      emoji,
      points: Number(points),
      categoryId,
      isRecurring: Boolean(isRecurring),
      recurringInterval: isRecurring ? recurringInterval : null,
      status: 'pending_approval',
      createdById: session.user.id,
    },
  })

  await prisma.taskApproval.create({
    data: {
      taskId: task.id,
      requestedById: session.user.id,
      status: 'pending',
    },
  })

  return NextResponse.json(task, { status: 201 })
}
```

- [ ] **Step 4: Write `src/app/api/tasks/[id]/complete/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextDueAt } from '@/lib/recurring'

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

  const completion = await prisma.taskCompletion.create({
    data: { taskId: task.id, userId: session.user.id, points: task.points },
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

  return NextResponse.json(completion, { status: 201 })
}
```

- [ ] **Step 5: Write `src/app/api/tasks/[id]/route.ts`**

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
  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      title: body.title,
      emoji: body.emoji,
      points: body.points !== undefined ? Number(body.points) : undefined,
      categoryId: body.categoryId,
      isRecurring: body.isRecurring,
      recurringInterval: body.recurringInterval ?? null,
    },
  })
  return NextResponse.json(task)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.task.update({
    where: { id: params.id },
    data: { status: 'archived' },
  })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npm test src/tests/api/tasks.test.ts
```

Expected: 2 tests passing.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/tasks/ src/tests/api/tasks.test.ts
git commit -m "feat: add task API routes (list, create, complete, edit, delete)"
```

---

### Task 9: API — Approvals

**Files:**
- Create: `src/app/api/approvals/[id]/route.ts`
- Create: `src/tests/api/approvals.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/tests/api/approvals.test.ts
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-2', name: 'Partner' } }),
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    taskApproval: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'approval-1',
        taskId: 'task-1',
        requestedById: 'user-1',
        status: 'pending',
      }),
      update: vi.fn().mockResolvedValue({ id: 'approval-1', status: 'approved' }),
    },
    task: {
      update: vi.fn().mockResolvedValue({ id: 'task-1', status: 'active' }),
    },
  },
}))

describe('POST /api/approvals/[id]', () => {
  it('approves a pending approval', async () => {
    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(200)
  })

  it('rejects a pending approval', async () => {
    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'reject' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test src/tests/api/approvals.test.ts
```

- [ ] **Step 3: Write `src/app/api/approvals/[id]/route.ts`**

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

  const { action } = await req.json()
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
  }

  const approval = await prisma.taskApproval.findUnique({ where: { id: params.id } })
  if (!approval || approval.status !== 'pending') {
    return NextResponse.json({ error: 'Genehmigung nicht gefunden' }, { status: 404 })
  }

  // User cannot approve their own task
  if (approval.requestedById === session.user.id) {
    return NextResponse.json({ error: 'Eigene Aufgaben können nicht genehmigt werden' }, { status: 403 })
  }

  await prisma.taskApproval.update({
    where: { id: params.id },
    data: { status: action === 'approve' ? 'approved' : 'rejected' },
  })

  await prisma.task.update({
    where: { id: approval.taskId },
    data: {
      status: action === 'approve' ? 'active' : 'rejected',
      approvedById: action === 'approve' ? session.user.id : undefined,
    },
  })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test src/tests/api/approvals.test.ts
```

Expected: 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/approvals/ src/tests/api/approvals.test.ts
git commit -m "feat: add approvals API with approve/reject logic"
```

---

### Task 10: API — Store

**Files:**
- Create: `src/app/api/store/route.ts`
- Create: `src/app/api/store/[id]/purchase/route.ts`
- Create: `src/app/api/store/[id]/redeem/route.ts`
- Create: `src/tests/api/store.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/tests/api/store.test.ts
import { vi, describe, it, expect } from 'vitest'

const mockSession = { user: { id: 'user-1', name: 'Franz' } }
const mockItem = { id: 'item-1', title: 'Putz-Profi', pointCost: 500, type: 'trophy', isActive: true }

vi.mock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(mockSession) }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeItem: {
      findMany: vi.fn().mockResolvedValue([mockItem]),
      findUnique: vi.fn().mockResolvedValue(mockItem),
    },
    taskCompletion: {
      findMany: vi.fn().mockResolvedValue([{ points: 1000 }]),
    },
    purchase: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'pur-1', pointsSpent: 500 }),
      findUnique: vi.fn().mockResolvedValue({ id: 'pur-1', userId: 'user-1', redeemedAt: null }),
      update: vi.fn().mockResolvedValue({ id: 'pur-1', redeemedAt: new Date() }),
    },
  },
}))

describe('GET /api/store', () => {
  it('returns store items', async () => {
    const { GET } = await import('@/app/api/store/route')
    const res = await GET(new Request('http://localhost/api/store') as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/store/[id]/purchase', () => {
  it('returns 201 on successful purchase', async () => {
    const { POST } = await import('@/app/api/store/[id]/purchase/route')
    const res = await POST(
      new Request('http://localhost/api/store/item-1/purchase', { method: 'POST' }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(201)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test src/tests/api/store.test.ts
```

- [ ] **Step 3: Write `src/app/api/store/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.storeItem.findMany({
    where: { isActive: true },
    orderBy: { pointCost: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const item = await prisma.storeItem.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}
```

- [ ] **Step 4: Write `src/app/api/store/[id]/purchase/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentPoints, getTotalEarned } from '@/lib/points'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.storeItem.findUnique({ where: { id: params.id } })
  if (!item || !item.isActive) {
    return NextResponse.json({ error: 'Artikel nicht gefunden' }, { status: 404 })
  }

  // Trophies: check not already owned
  if (item.type === 'trophy') {
    const existing = await prisma.purchase.findFirst({
      where: { itemId: params.id, userId: session.user.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'Trophäe bereits erworben' }, { status: 409 })
    }
  }

  // Check points balance
  const completions = await prisma.taskCompletion.findMany({
    where: { userId: session.user.id },
    select: { points: true },
  })
  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    select: { pointsSpent: true },
  })
  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((s, p) => s + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)

  if (balance < item.pointCost) {
    return NextResponse.json({ error: 'Nicht genug Punkte' }, { status: 402 })
  }

  const purchase = await prisma.purchase.create({
    data: { itemId: params.id, userId: session.user.id, pointsSpent: item.pointCost },
  })
  return NextResponse.json(purchase, { status: 201 })
}
```

- [ ] **Step 5: Write `src/app/api/store/[id]/redeem/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findUnique({ where: { id: params.id } })
  if (!purchase || purchase.userId !== session.user.id) {
    return NextResponse.json({ error: 'Kauf nicht gefunden' }, { status: 404 })
  }
  if (purchase.redeemedAt) {
    return NextResponse.json({ error: 'Bereits eingelöst' }, { status: 409 })
  }

  const updated = await prisma.purchase.update({
    where: { id: params.id },
    data: { redeemedAt: new Date() },
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npm test src/tests/api/store.test.ts
```

Expected: 2 tests passing.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/store/ src/tests/api/store.test.ts
git commit -m "feat: add store API (list, purchase, redeem) with points balance check"
```

---

### Task 11: API — Feed & Stats

**Files:**
- Create: `src/app/api/feed/route.ts`
- Create: `src/app/api/stats/route.ts`
- Create: `src/tests/api/stats.test.ts`

- [ ] **Step 1: Write `src/app/api/feed/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const completions = await prisma.taskCompletion.findMany({
    take: 50,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { id: true, title: true, emoji: true } },
    },
  })

  const feed = completions.map((c) => ({
    id: c.id,
    type: 'completion' as const,
    user: c.user,
    task: c.task,
    points: c.points,
    at: c.completedAt,
  }))

  return NextResponse.json(feed)
}
```

- [ ] **Step 2: Write `src/app/api/stats/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevel, getTotalEarned } from '@/lib/points'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('tab') ?? 'personal'
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

  const dateFilter = from || to
    ? { completedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
    : {}

  if (tab === 'personal') {
    const completions = await prisma.taskCompletion.findMany({
      where: { userId: session.user.id, ...dateFilter },
      include: { task: { select: { title: true, emoji: true } } },
      orderBy: { completedAt: 'asc' },
    })

    const allTimeCompletions = await prisma.taskCompletion.findMany({
      where: { userId: session.user.id },
      select: { points: true },
    })
    const totalEarned = getTotalEarned(allTimeCompletions)

    // Streak
    const daySet = new Set(
      completions.map((c) => c.completedAt.toISOString().slice(0, 10))
    )
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() - i)
      if (daySet.has(d.toISOString().slice(0, 10))) {
        streak++
      } else {
        break
      }
    }

    // Top tasks
    const taskCount: Record<string, { count: number; title: string; emoji: string }> = {}
    for (const c of completions) {
      const key = c.taskId
      if (!taskCount[key]) taskCount[key] = { count: 0, title: c.task.title, emoji: c.task.emoji }
      taskCount[key].count++
    }
    const topTasks = Object.values(taskCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Heatmap: points per day
    const heatmap: Record<string, number> = {}
    for (const c of completions) {
      const day = c.completedAt.toISOString().slice(0, 10)
      heatmap[day] = (heatmap[day] ?? 0) + c.points
    }

    return NextResponse.json({
      totalCompletions: completions.length,
      totalPointsEarned: completions.reduce((s, c) => s + c.points, 0),
      level: getLevel(totalEarned),
      streak,
      topTasks,
      heatmap,
    })
  }

  // Comparison tab
  const allCompletions = await prisma.taskCompletion.findMany({
    where: dateFilter,
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { categoryId: true } },
    },
    orderBy: { completedAt: 'asc' },
  })

  // Group by week and user
  const byWeek: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const week = getWeekKey(c.completedAt)
    if (!byWeek[week]) byWeek[week] = {}
    byWeek[week][c.user.name] = (byWeek[week][c.user.name] ?? 0) + c.points
  }

  // Category distribution per user
  const byCategory: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const cat = c.task.categoryId
    if (!byCategory[cat]) byCategory[cat] = {}
    byCategory[cat][c.user.name] = (byCategory[cat][c.user.name] ?? 0) + 1
  }

  return NextResponse.json({ byWeek, byCategory })
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d.toISOString().slice(0, 10)
}
```

- [ ] **Step 3: Write minimal stats test**

```typescript
// src/tests/api/stats.test.ts
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-1', name: 'Franz' } }),
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    taskCompletion: {
      findMany: vi.fn().mockResolvedValue([
        { taskId: 'task-1', points: 50, completedAt: new Date('2026-04-01'),
          task: { title: 'Abwasch', emoji: '🍽️', categoryId: 'cat-1' },
          user: { id: 'user-1', name: 'Franz' } },
      ]),
    },
  },
}))

describe('GET /api/stats?tab=personal', () => {
  it('returns personal stats with streak and topTasks', async () => {
    const { GET } = await import('@/app/api/stats/route')
    const req = new Request('http://localhost/api/stats?tab=personal')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('topTasks')
    expect(data).toHaveProperty('heatmap')
    expect(data).toHaveProperty('streak')
  })
})
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: All tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/feed/ src/app/api/stats/ src/tests/api/stats.test.ts
git commit -m "feat: add feed and stats API routes"
```

---

### Task 12: App Shell & Navigation

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/nav/navigation.tsx`

- [ ] **Step 1: Write `src/components/nav/navigation.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, BarChart2, Shield, Settings } from 'lucide-react'

const NAV = [
  { href: '/',           icon: Home,         label: 'Home' },
  { href: '/tasks',      icon: CheckSquare,  label: 'Aufgaben' },
  { href: '/store',      icon: ShoppingBag,  label: 'Store' },
  { href: '/stats',      icon: BarChart2,    label: 'Statistik' },
  { href: '/approvals',  icon: Shield,       label: 'Freigaben' },
  { href: '/admin',      icon: Settings,     label: 'Admin' },
]

export function Navigation() {
  const pathname = usePathname()
  return (
    <>
      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-50">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              pathname === href ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-3">🏠 Haushalt-Quest</div>
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === href
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Install lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 3: Write `src/app/(app)/layout.tsx`**

```tsx
import { Navigation } from '@/components/nav/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-3xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000` (nach Login) — Bottom-Nav auf Handy-Breite sichtbar, Sidebar auf Desktop.

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/layout.tsx src/components/nav/
git commit -m "feat: add app shell with responsive navigation"
```

---

### Task 13: Dashboard Page

**Files:**
- Create: `src/components/dashboard/points-header.tsx`
- Create: `src/components/dashboard/feed-item.tsx`
- Create: `src/app/(app)/page.tsx`

- [ ] **Step 1: Write `src/components/dashboard/points-header.tsx`**

```tsx
import { getLevel } from '@/lib/points'

type UserStat = { id: string; name: string; earned: number; spent: number }

export function PointsHeader({ users }: { users: UserStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {users.map((u, i) => {
        const balance = Math.max(0, u.earned - u.spent)
        const { title } = getLevel(u.earned)
        const color = i === 0 ? 'indigo' : 'pink'
        return (
          <div key={u.id} className={`rounded-2xl p-4 bg-${color}-500 text-white`}>
            <p className="text-xs opacity-75 uppercase tracking-wide">{u.name}</p>
            <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">{title}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/dashboard/feed-item.tsx`**

```tsx
type FeedEntry = {
  id: string
  type: 'completion'
  user: { id: string; name: string }
  task: { title: string; emoji: string }
  points: number
  at: string
}

export function FeedItem({ entry, currentUserId }: { entry: FeedEntry; currentUserId: string }) {
  const isMe = entry.user.id === currentUserId
  const color = isMe ? 'indigo' : 'pink'
  const time = new Date(entry.at).toLocaleString('de-DE', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`flex items-start gap-3 p-3 border-l-4 border-${color}-400 bg-white rounded-r-lg shadow-sm`}>
      <span className="text-2xl">{entry.task.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          <span className={`text-${color}-600`}>{entry.user.name}</span>
          {' '}hat{' '}
          <span className="font-semibold">"{entry.task.title}"</span>
          {' '}erledigt
        </p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <span className={`text-sm font-bold text-${color}-600 whitespace-nowrap`}>
        +{entry.points} Pkt
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/app/(app)/page.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getCurrentPoints } from '@/lib/points'
import { PointsHeader } from '@/components/dashboard/points-header'
import { FeedItem } from '@/components/dashboard/feed-item'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const users = await prisma.user.findMany({
    include: {
      completions: { select: { points: true } },
      purchases: { select: { pointsSpent: true } },
    },
  })

  const userStats = users.map((u) => ({
    id: u.id,
    name: u.name,
    earned: getTotalEarned(u.completions),
    spent: u.purchases.reduce((s, p) => s + p.pointsSpent, 0),
  }))

  const completions = await prisma.taskCompletion.findMany({
    take: 30,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { title: true, emoji: true } },
    },
  })

  const feed = completions.map((c) => ({
    id: c.id,
    type: 'completion' as const,
    user: c.user,
    task: c.task,
    points: c.points,
    at: c.completedAt.toISOString(),
  }))

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <PointsHeader users={userStats} />
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Letzte Aktivitäten
      </h2>
      <div className="space-y-2">
        {feed.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">
            Noch keine Aktivitäten. Erledige die erste Aufgabe!
          </p>
        )}
        {feed.map((entry) => (
          <FeedItem key={entry.id} entry={entry} currentUserId={session!.user.id} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify dashboard renders**

```bash
npm run dev
```

Open `http://localhost:3000` — Punktestand beider Nutzer sichtbar, Feed leer (noch keine Aufgaben).

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/page.tsx src/components/dashboard/
git commit -m "feat: add dashboard with points header and activity feed"
```

---

### Task 14: Tasks Page

**Files:**
- Create: `src/components/tasks/task-card.tsx`
- Create: `src/components/tasks/task-category-group.tsx`
- Create: `src/app/(app)/tasks/page.tsx`

- [ ] **Step 1: Write `src/components/tasks/task-card.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}

export function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleComplete() {
    setLoading(true)
    await onComplete(task.id)
    setDone(true)
    setLoading(false)
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
      <Button size="sm" onClick={handleComplete} disabled={loading}>
        {loading ? '…' : '✓'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/tasks/task-category-group.tsx`**

```tsx
import { TaskCard } from './task-card'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }

export function TaskCategoryGroup({
  category,
  onComplete,
}: {
  category: Category
  onComplete: (id: string) => Promise<void>
}) {
  if (category.tasks.length === 0) return null
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {category.emoji} {category.name}
      </h2>
      <div className="space-y-2">
        {category.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onComplete} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/app/(app)/tasks/page.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TasksClient } from './tasks-client'

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  const now = new Date()
  const tasks = await prisma.task.findMany({
    where: { status: 'active' },
    include: { category: true },
    orderBy: { points: 'desc' },
  })

  const visible = tasks.filter(
    (t) => !t.isRecurring || !t.nextDueAt || t.nextDueAt <= now
  )

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  const grouped = categories.map((cat) => ({
    ...cat,
    tasks: visible.filter((t) => t.categoryId === cat.id),
  }))

  return <TasksClient grouped={grouped} userId={session!.user.id} />
}
```

- [ ] **Step 4: Write `src/app/(app)/tasks/tasks-client.tsx`**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { TaskCategoryGroup } from '@/components/tasks/task-category-group'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }

export function TasksClient({ grouped, userId }: { grouped: Category[]; userId: string }) {
  const router = useRouter()

  async function handleComplete(taskId: string) {
    await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' })
    router.refresh()
  }

  const total = grouped.reduce((s, c) => s + c.tasks.length, 0)

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Aufgaben</h1>
      <p className="text-sm text-slate-500 mb-6">{total} offene Aufgaben</p>
      {total === 0 && (
        <p className="text-center text-slate-400 py-12">
          🎉 Alle Aufgaben erledigt!
        </p>
      )}
      {grouped.map((cat) => (
        <TaskCategoryGroup key={cat.id} category={cat} onComplete={handleComplete} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Verify tasks page works**

```bash
npm run dev
```

Navigate to `/tasks` — Kategorien sichtbar, Aufgaben noch leer (noch keine active Tasks in DB).

Seed einige Testaufgaben:
```bash
npx prisma studio
```
Füge manuell eine Task mit `status: "active"` ein, dann reload `/tasks`.

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/tasks/ src/components/tasks/
git commit -m "feat: add tasks page with category grouping and complete action"
```

---

### Task 15: Approvals Page

**Files:**
- Create: `src/components/approvals/approval-card.tsx`
- Create: `src/app/(app)/approvals/page.tsx`

- [ ] **Step 1: Write `src/components/approvals/approval-card.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Approval = {
  id: string
  task: { title: string; emoji: string; points: number; isRecurring: boolean; recurringInterval: string | null }
  requestedBy: { name: string }
}

export function ApprovalCard({
  approval,
  onAction,
}: {
  approval: Approval
  onAction: (id: string, action: 'approve' | 'reject') => Promise<void>
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState(false)

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    await onAction(approval.id, action)
    setDone(true)
    setLoading(null)
  }

  if (done) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{approval.task.emoji}</span>
        <div className="flex-1">
          <p className="font-medium">{approval.task.title}</p>
          <p className="text-sm text-slate-500">
            Von {approval.requestedBy.name} · {' '}
            {approval.task.isRecurring
              ? `Wiederkehrend (${approval.task.recurringInterval === 'daily' ? 'täglich' : approval.task.recurringInterval === 'weekly' ? 'wöchentlich' : 'monatlich'})`
              : 'Einmalig'}
          </p>
        </div>
        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
          +{approval.task.points} Pkt
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => handle('reject')}
          disabled={loading !== null}
        >
          {loading === 'reject' ? '…' : '✗ Ablehnen'}
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={() => handle('approve')}
          disabled={loading !== null}
        >
          {loading === 'approve' ? '…' : '✓ Genehmigen'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/(app)/approvals/page.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApprovalsClient } from './approvals-client'

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  const approvals = await prisma.taskApproval.findMany({
    where: {
      status: 'pending',
      requestedById: { not: session!.user.id }, // only show others' requests
    },
    include: {
      task: true,
      requestedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <ApprovalsClient approvals={approvals} />
}
```

- [ ] **Step 3: Write `src/app/(app)/approvals/approvals-client.tsx`**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { ApprovalCard } from '@/components/approvals/approval-card'

type Approval = {
  id: string
  task: { title: string; emoji: string; points: number; isRecurring: boolean; recurringInterval: string | null }
  requestedBy: { name: string }
}

export function ApprovalsClient({ approvals }: { approvals: Approval[] }) {
  const router = useRouter()

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Freigaben</h1>
      <p className="text-sm text-slate-500 mb-6">{approvals.length} offene Anfragen</p>
      {approvals.length === 0 ? (
        <p className="text-center text-slate-400 py-12">
          ✅ Keine offenen Anfragen
        </p>
      ) : (
        <div className="space-y-4">
          {approvals.map((a) => (
            <ApprovalCard key={a.id} approval={a} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/approvals/ src/components/approvals/
git commit -m "feat: add approvals page with approve/reject UI"
```

---

### Task 16: Store Page

**Files:**
- Create: `src/components/store/store-item-card.tsx`
- Create: `src/app/(app)/store/page.tsx`

- [ ] **Step 1: Write `src/components/store/store-item-card.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type StoreItem = {
  id: string; title: string; description: string; emoji: string
  pointCost: number; type: string; alreadyOwned?: boolean
}

export function StoreItemCard({
  item,
  userBalance,
  onPurchase,
}: {
  item: StoreItem
  userBalance: number
  onPurchase: (id: string) => Promise<{ error?: string }>
}) {
  const [loading, setLoading] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [error, setError] = useState('')
  const canAfford = userBalance >= item.pointCost

  async function handlePurchase() {
    setLoading(true)
    setError('')
    const res = await onPurchase(item.id)
    if (res.error) {
      setError(res.error)
    } else {
      setPurchased(true)
    }
    setLoading(false)
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 space-y-2 ${purchased ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-slate-500">{item.description}</p>
        </div>
        <Badge variant="outline" className="shrink-0 font-bold">
          {item.pointCost} Pkt
        </Badge>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {purchased ? (
        <p className="text-green-600 text-sm font-medium">✓ Gekauft!</p>
      ) : item.alreadyOwned ? (
        <p className="text-slate-400 text-sm">Bereits erworben</p>
      ) : (
        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={loading || !canAfford}
          variant={canAfford ? 'default' : 'outline'}
        >
          {loading ? '…' : canAfford ? 'Kaufen' : 'Nicht genug Punkte'}
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/app/(app)/store/page.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getCurrentPoints } from '@/lib/points'
import { StoreClient } from './store-client'

export default async function StorePage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const items = await prisma.storeItem.findMany({ where: { isActive: true } })
  const completions = await prisma.taskCompletion.findMany({
    where: { userId }, select: { points: true },
  })
  const purchases = await prisma.purchase.findMany({
    where: { userId }, select: { pointsSpent: true, itemId: true },
  })

  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((s, p) => s + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)
  const ownedItemIds = new Set(purchases.map((p) => p.itemId))

  const trophies = items.filter((i) => i.type === 'trophy').map((i) => ({
    ...i, alreadyOwned: ownedItemIds.has(i.id),
  }))
  const rewards = items.filter((i) => i.type === 'real_reward').map((i) => ({
    ...i, alreadyOwned: false,
  }))

  return <StoreClient trophies={trophies} rewards={rewards} balance={balance} />
}
```

- [ ] **Step 3: Write `src/app/(app)/store/store-client.tsx`**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { StoreItemCard } from '@/components/store/store-item-card'

type Item = {
  id: string; title: string; description: string; emoji: string
  pointCost: number; type: string; alreadyOwned: boolean
}

export function StoreClient({
  trophies, rewards, balance,
}: {
  trophies: Item[]; rewards: Item[]; balance: number
}) {
  const router = useRouter()

  async function handlePurchase(itemId: string) {
    const res = await fetch(`/api/store/${itemId}/purchase`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Fehler beim Kauf' }
    router.refresh()
    return {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Store</h1>
        <span className="text-indigo-600 font-semibold">{balance.toLocaleString()} Pkt</span>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🏆 Trophäen
      </h2>
      <div className="space-y-3 mb-8">
        {trophies.length === 0 && <p className="text-slate-400 text-sm">Keine Trophäen verfügbar.</p>}
        {trophies.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🎁 Belohnungen
      </h2>
      <div className="space-y-3">
        {rewards.length === 0 && <p className="text-slate-400 text-sm">Keine Belohnungen verfügbar.</p>}
        {rewards.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/store/ src/components/store/
git commit -m "feat: add store page with trophies and rewards sections"
```

---

### Task 17: Stats Page

**Files:**
- Create: `src/components/stats/heatmap.tsx`
- Create: `src/components/stats/comparison-chart.tsx`
- Create: `src/components/stats/category-pie-chart.tsx`
- Create: `src/app/(app)/stats/page.tsx`

- [ ] **Step 1: Write `src/components/stats/heatmap.tsx`**

```tsx
type HeatmapProps = { data: Record<string, number> }

const MAX_WEEKS = 26 // half year

function getColor(points: number): string {
  if (points === 0) return '#e2e8f0'
  if (points < 50) return '#c7d2fe'
  if (points < 150) return '#818cf8'
  if (points < 300) return '#6366f1'
  return '#4338ca'
}

export function Heatmap({ data }: HeatmapProps) {
  const today = new Date()
  const days: { date: string; points: number }[] = []

  for (let i = MAX_WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, points: data[key] ?? 0 })
  }

  return (
    <div
      className="grid gap-1 overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${MAX_WEEKS}, 12px)`, gridTemplateRows: 'repeat(7, 12px)' }}
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

- [ ] **Step 2: Write `src/components/stats/comparison-chart.tsx`**

```tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = { byWeek: Record<string, Record<string, number>> }

export function ComparisonChart({ byWeek }: Props) {
  const data = Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, users]) => ({ week: week.slice(5), ...users }))

  const names = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== 'week')
    : []

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend />
        {names.map((name, i) => (
          <Bar key={name} dataKey={name} fill={i === 0 ? '#6366f1' : '#ec4899'} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Write `src/components/stats/category-pie-chart.tsx`**

```tsx
'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = { byCategory: Record<string, Record<string, number>>; categories: { id: string; name: string }[] }

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function CategoryPieChart({ byCategory, categories }: Props) {
  // Show total completions per category across both users
  const data = Object.entries(byCategory).map(([catId, users]) => {
    const cat = categories.find((c) => c.id === catId)
    return {
      name: cat?.name ?? catId,
      value: Object.values(users).reduce((s, v) => s + v, 0),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Write `src/app/(app)/stats/page.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'
import { StatsClient } from './stats-client'

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    include: { task: { select: { title: true, emoji: true, categoryId: true } } },
    orderBy: { completedAt: 'asc' },
  })

  const allCompletions = await prisma.taskCompletion.findMany({
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { categoryId: true } },
    },
    orderBy: { completedAt: 'asc' },
  })

  const categories = await prisma.category.findMany()

  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  const taskCount: Record<string, { count: number; title: string; emoji: string }> = {}
  for (const c of completions) {
    if (!taskCount[c.taskId]) taskCount[c.taskId] = { count: 0, title: c.task.title, emoji: c.task.emoji }
    taskCount[c.taskId].count++
  }
  const topTasks = Object.values(taskCount).sort((a, b) => b.count - a.count).slice(0, 5)

  const daySet = new Set(completions.map((c) => c.completedAt.toISOString().slice(0, 10)))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    if (daySet.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  const totalEarned = getTotalEarned(completions)
  const level = getLevel(totalEarned)

  const byWeek: Record<string, Record<string, number>> = {}
  const byCategory: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const d = new Date(c.completedAt)
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    const week = d.toISOString().slice(0, 10)
    if (!byWeek[week]) byWeek[week] = {}
    byWeek[week][c.user.name] = (byWeek[week][c.user.name] ?? 0) + c.points

    const cat = c.task.categoryId
    if (!byCategory[cat]) byCategory[cat] = {}
    byCategory[cat][c.user.name] = (byCategory[cat][c.user.name] ?? 0) + 1
  }

  // Purchase history for personal tab
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { item: { select: { title: true, emoji: true, type: true } } },
    orderBy: { purchasedAt: 'desc' },
  })

  // Monthly summary for comparison tab
  const byMonth: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const month = c.completedAt.toISOString().slice(0, 7)
    if (!byMonth[month]) byMonth[month] = {}
    byMonth[month][c.user.name] = (byMonth[month][c.user.name] ?? 0) + c.points
  }

  return (
    <StatsClient
      personal={{ heatmap, topTasks, streak, totalCompletions: completions.length, totalPointsEarned: totalEarned, level, purchases }}
      comparison={{ byWeek, byCategory, byMonth }}
      categories={categories}
    />
  )
}
```

- [ ] **Step 5: Write `src/app/(app)/stats/stats-client.tsx`**

```tsx
'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heatmap } from '@/components/stats/heatmap'
import { ComparisonChart } from '@/components/stats/comparison-chart'
import { CategoryPieChart } from '@/components/stats/category-pie-chart'

type Level = { level: number; title: string }
type Purchase = { id: string; purchasedAt: string; redeemedAt: string | null; pointsSpent: number; item: { title: string; emoji: string; type: string } }
type Personal = {
  heatmap: Record<string, number>; topTasks: { title: string; emoji: string; count: number }[]
  streak: number; totalCompletions: number; totalPointsEarned: number; level: Level; purchases: Purchase[]
}
type Comparison = {
  byWeek: Record<string, Record<string, number>>
  byCategory: Record<string, Record<string, number>>
  byMonth: Record<string, Record<string, number>>
}

export function StatsClient({
  personal, comparison, categories,
}: {
  personal: Personal; comparison: Comparison; categories: { id: string; name: string }[]
}) {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Statistiken</h1>
      <Tabs defaultValue="personal">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="personal" className="flex-1">Meine Stats</TabsTrigger>
          <TabsTrigger value="comparison" className="flex-1">Vergleich</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Aufgaben', value: personal.totalCompletions },
              { label: 'Punkte verdient', value: personal.totalPointsEarned },
              { label: '🔥 Streak', value: `${personal.streak} Tage` },
              { label: 'Level', value: `${personal.level.level} · ${personal.level.title}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="font-bold text-indigo-700">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Aktivitäts-Heatmap
            </p>
            <Heatmap data={personal.heatmap} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Top Aufgaben
            </p>
            <div className="space-y-2">
              {personal.topTasks.map((t) => (
                <div key={t.title} className="flex items-center gap-2">
                  <span>{t.emoji}</span>
                  <span className="text-sm flex-1">{t.title}</span>
                  <span className="text-sm font-bold text-indigo-600">{t.count}×</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Belohnungs-Historie
            </p>
            {personal.purchases.length === 0 ? (
              <p className="text-slate-400 text-sm">Noch keine Käufe.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2">Artikel</th>
                    <th className="text-right pb-2">Datum</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.purchases.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2">{p.item.emoji} {p.item.title}</td>
                      <td className="py-2 text-right text-slate-500 text-xs">
                        {new Date(p.purchasedAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-2 text-right">
                        {p.redeemedAt
                          ? <span className="text-green-600 text-xs">Eingelöst</span>
                          : p.item.type === 'real_reward'
                            ? <span className="text-amber-500 text-xs">Ausstehend</span>
                            : <span className="text-indigo-600 text-xs">✓</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Champion Banner */}
          {Object.keys(comparison.byWeek).length > 0 && (() => {
            const totals: Record<string, number> = {}
            Object.values(comparison.byWeek).forEach(week =>
              Object.entries(week).forEach(([name, pts]) => { totals[name] = (totals[name] ?? 0) + pts })
            )
            const champion = Object.entries(totals).sort(([,a],[,b]) => b - a)[0]
            return champion ? (
              <div className="bg-indigo-600 text-white rounded-xl p-4 text-center">
                <p className="text-xs opacity-75 mb-1">🏆 Haushalts-Champion</p>
                <p className="text-2xl font-bold">{champion[0]}</p>
                <p className="text-sm opacity-75">{champion[1].toLocaleString()} Punkte im gewählten Zeitraum</p>
              </div>
            ) : null
          })()}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Punkte pro Woche
            </p>
            <ComparisonChart byWeek={comparison.byWeek} />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Aufgaben nach Kategorie
            </p>
            <CategoryPieChart byCategory={comparison.byCategory} categories={categories} />
          </div>
          {/* Monthly summary table */}
          <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Monatliche Übersicht
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-left pb-2">Monat</th>
                  {Object.values(comparison.byWeek)[0] && Object.keys(Object.values(comparison.byWeek)[0]).map(name => (
                    <th key={name} className="text-right pb-2">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparison.byMonth).sort(([a],[b]) => b.localeCompare(a)).slice(0,6).map(([month, users]) => (
                  <tr key={month} className="border-t border-slate-100">
                    <td className="py-2 text-slate-600">{month}</td>
                    {Object.entries(users).map(([name, pts]) => (
                      <td key={name} className="py-2 text-right font-medium">{pts}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/stats/ src/components/stats/
git commit -m "feat: add stats page with heatmap, top tasks, and comparison charts"
```

---

### Task 18: Admin Page

**Files:**
- Create: `src/app/(app)/admin/page.tsx`

- [ ] **Step 1: Write `src/app/(app)/admin/page.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const categories = await prisma.category.findMany()
  const storeItems = await prisma.storeItem.findMany({ orderBy: { type: 'asc' } })
  const tasks = await prisma.task.findMany({
    where: { status: { in: ['active', 'pending_approval'] } },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminClient
      categories={categories}
      storeItems={storeItems}
      tasks={tasks}
      userId={session!.user.id}
    />
  )
}
```

- [ ] **Step 2: Write `src/app/(app)/admin/admin-client.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Category = { id: string; name: string; emoji: string }
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: Category }

export function AdminClient({ categories, storeItems, tasks, userId }: {
  categories: Category[]; storeItems: StoreItem[]; tasks: Task[]; userId: string
}) {
  const router = useRouter()

  // --- New Task form ---
  const [taskForm, setTaskForm] = useState({
    title: '', emoji: '🏠', points: 30, categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
  })

  async function createTask() {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskForm),
    })
    router.refresh()
  }

  // --- New Store Item form ---
  const [itemForm, setItemForm] = useState({
    title: '', emoji: '🏆', description: '', pointCost: 500, type: 'trophy',
  })

  async function createStoreItem() {
    await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...itemForm, isActive: true }),
    })
    router.refresh()
  }

  // --- Archive task ---
  async function archiveTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Admin</h1>
      <Tabs defaultValue="tasks">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="tasks" className="flex-1">Aufgaben</TabsTrigger>
          <TabsTrigger value="store" className="flex-1">Store</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold">Neue Aufgabe anlegen</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Emoji</Label>
                <Input value={taskForm.emoji} onChange={(e) => setTaskForm({ ...taskForm, emoji: e.target.value })} />
              </div>
              <div>
                <Label>Punkte</Label>
                <Input type="number" value={taskForm.points} onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Titel</Label>
              <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Kategorie</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={taskForm.categoryId}
                onChange={(e) => setTaskForm({ ...taskForm, categoryId: e.target.value })}
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recurring" checked={taskForm.isRecurring}
                onChange={(e) => setTaskForm({ ...taskForm, isRecurring: e.target.checked })} />
              <Label htmlFor="recurring">Wiederkehrend</Label>
              {taskForm.isRecurring && (
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={taskForm.recurringInterval}
                  onChange={(e) => setTaskForm({ ...taskForm, recurringInterval: e.target.value })}
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="monthly">Monatlich</option>
                </select>
              )}
            </div>
            <Button onClick={createTask} disabled={!taskForm.title || !taskForm.categoryId}>
              Aufgabe anlegen (→ Freigabe nötig)
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Aktive Aufgaben</h2>
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <span>{t.emoji}</span>
                <span className="flex-1 text-sm">{t.title}</span>
                <span className="text-xs text-slate-400">{t.status}</span>
                <Button variant="outline" size="sm" onClick={() => archiveTask(t.id)}>Archivieren</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold">Neuen Store-Artikel anlegen</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Emoji</Label>
                <Input value={itemForm.emoji} onChange={(e) => setItemForm({ ...itemForm, emoji: e.target.value })} />
              </div>
              <div>
                <Label>Preis (Pkt)</Label>
                <Input type="number" value={itemForm.pointCost} onChange={(e) => setItemForm({ ...itemForm, pointCost: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Titel</Label>
              <Input value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Typ</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={itemForm.type}
                onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
              >
                <option value="trophy">🏆 Trophäe</option>
                <option value="real_reward">🎁 Belohnung</option>
              </select>
            </div>
            <Button onClick={createStoreItem} disabled={!itemForm.title || !itemForm.description}>
              Artikel anlegen
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Store-Artikel</h2>
            {storeItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <span>{item.emoji}</span>
                <span className="flex-1 text-sm">{item.title}</span>
                <span className="text-xs text-slate-400">{item.pointCost} Pkt</span>
                <span className="text-xs text-slate-400">{item.type}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 3: Add PIN-change API `src/app/api/users/[id]/pin/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pin } = await req.json()
  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: 'PIN muss mindestens 4 Zeichen haben' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(pin, 10)
  await prisma.user.update({ where: { id: params.id }, data: { pin: hashed } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Add PIN-change UI and approval badge to `admin-client.tsx`**

Add a new Tabs entry "Einstellungen" to `AdminClient` with:

```tsx
// In AdminClient — zusätzlicher Tab "Einstellungen"
const [users, setUsers] = useState<{id: string; name: string}[]>([])
const [newPin, setNewPin] = useState<Record<string, string>>({})

// Fetch users on mount
useEffect(() => {
  fetch('/api/users').then(r => r.json()).then(setUsers)
}, [])

async function changePin(userId: string) {
  await fetch(`/api/users/${userId}/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: newPin[userId] }),
  })
  setNewPin(prev => ({ ...prev, [userId]: '' }))
}
```

Add `/api/users/route.ts` to list users:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await prisma.user.findMany({ select: { id: true, name: true } })
  return NextResponse.json(users)
}
```

- [ ] **Step 5: Add approval badge to Navigation**

In `src/components/nav/navigation.tsx`, fetch pending approvals count and show badge:

```tsx
// Add to Navigation component
async function getApprovalCount(userId: string): Promise<number> {
  const res = await fetch('/api/approvals/count')
  const data = await res.json()
  return data.count
}
```

Add `src/app/api/approvals/count/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const count = await prisma.taskApproval.count({
    where: {
      status: 'pending',
      requestedById: { not: session.user.id },
    },
  })
  return NextResponse.json({ count })
}
```

In `navigation.tsx` show a red dot when count > 0 on the Freigaben-Link (fetch server-side in the layout via a Server Component wrapper).

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/admin/ src/app/api/users/ src/app/api/approvals/count/
git commit -m "feat: add admin page for task and store item management, PIN change, approval badge"
```

---

### Task 19: Docker & Deployment

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

- [ ] **Step 1: Write `Dockerfile`**

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

- [ ] **Step 2: Enable standalone output in `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

- [ ] **Step 3: Write `docker-compose.yml`**

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/haushalts.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
```

- [ ] **Step 4: Write `.dockerignore`**

```
.git
.next
node_modules
*.db
.env
.env.local
.superpowers
```

- [ ] **Step 5: Write deploy script**

```bash
# deploy auf Raspberry Pi — lokal ausführen:
# 1. Build und push (oder direkt auf Pi builden):
docker build -t haushalt-quest .
docker save haushalt-quest | ssh pi@<raspberry-pi-ip> docker load

# 2. Auf dem Pi (oder per SSH):
# NEXTAUTH_SECRET=$(openssl rand -base64 32) aus .env befüllen
# NEXTAUTH_URL=http://<pi-ip>:3000

docker-compose up -d
```

- [ ] **Step 6: Test Docker build locally**

```bash
docker compose build
docker compose up
```

Open `http://localhost:3000` — App vollständig in Docker verfügbar.

- [ ] **Step 7: Seed Produktionsdatenbank**

```bash
# Auf dem Pi nach erstem Start:
docker compose exec app npx prisma db seed
```

- [ ] **Step 8: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore next.config.js
git commit -m "feat: add Docker configuration for Raspberry Pi deployment"
```

---

### Task 20: Abschluss & Smoke Test

- [ ] **Step 1: Alle Tests grün**

```bash
npm test
```

Expected: Alle Tests PASS.

- [ ] **Step 2: Vollständiger Ablauf manuell testen**

```
1. http://localhost:3000 → Redirect zu /login
2. Als Franz (PIN 1234) einloggen → Dashboard
3. /admin → Neue Aufgabe anlegen (Abwasch, Küche, 30 Pkt, einmalig)
4. Als Partner (PIN 5678) einloggen → /approvals → Genehmigen
5. Als Franz einloggen → /tasks → Abwasch erledigen
6. Dashboard → Feed zeigt Erledigung
7. /admin → Store-Trophäe anlegen (Putz-Profi, 50 Pkt)
8. /store → Trophäe kaufen (nur wenn Punkte ≥ 50)
9. /stats → Heatmap und Streak prüfen
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and smoke test"
```
