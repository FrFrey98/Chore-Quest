# Haushalt-Quest Optimierungen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verbessere die UX von Haushalt-Quest mit 8 Optimierungen: Michelle statt Partner, initiale Seed-Daten, Inline-Erstellung auf /tasks und /store, Toast-Feedback, Undo bei Erledigungen, Pending-Rewards-Flow, bessere Empty-States, und kompaktere Mobile-Navigation.

**Architecture:** Alle Änderungen sind inkrementell auf dem bestehenden Next.js 14 App Router Projekt. Neue UI-Komponenten (Toast, Dialoge) nutzen die vorhandene shadcn/ui-Bibliothek. Die Undo-Funktion arbeitet mit einem DELETE-Endpoint und einem zeitlich begrenzten Client-Side-Snackbar. Die Seed-Datei wird erweitert, um direkt nutzbare Aufgaben und Store-Items anzulegen.

**Tech Stack:** Next.js 14 (App Router), Prisma 7 + SQLite, NextAuth.js v4, Tailwind CSS, shadcn/ui (Dialog, Button, Input, Label), Recharts, Vitest

**Existing code conventions:**
- Prisma-Import: `import { PrismaClient } from '../src/generated/prisma/client'` (seed) bzw. `import { prisma } from '@/lib/prisma'` (app)
- Session guard: `if (!session?.user?.id) redirect('/login')`
- API-Fehler: `NextResponse.json({ error: 'message' }, { status: code })`
- Client components: `'use client'` Direktive, `useRouter` + `router.refresh()` nach Mutationen
- Statische Tailwind-Klassen (kein `bg-${var}-500`)
- Nullable `user.name`: immer `?? 'Unbekannt'` Fallback
- Tests: Vitest v4 mit `vi.mock` für next-auth, @/lib/auth, @/lib/prisma

---

## File Structure

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `prisma/seed.ts` | "Partner" → "Michelle", initiale Aufgaben + Store-Items |
| Modify | `src/tests/api/approvals.test.ts` | "Partner" → "Michelle" in Mock |
| Create | `src/components/ui/toast.tsx` | Toast-Notification Komponente |
| Create | `src/components/toast-provider.tsx` | Globaler Toast-Provider mit Context |
| Modify | `src/app/(app)/layout.tsx` | ToastProvider einbinden |
| Create | `src/app/api/tasks/[id]/complete/undo/route.ts` | DELETE-Endpoint für Undo |
| Modify | `src/components/tasks/task-card.tsx` | Undo-Snackbar nach Erledigung |
| Modify | `src/app/(app)/tasks/tasks-client.tsx` | "+ Aufgabe"-Button, Dialog, Categories-Prop |
| Modify | `src/app/(app)/tasks/page.tsx` | Categories an TasksClient übergeben |
| Create | `src/components/tasks/create-task-dialog.tsx` | Dialog zum Anlegen neuer Aufgaben |
| Modify | `src/app/(app)/store/store-client.tsx` | "+ Belohnung"-Button, Dialog, Pending-Rewards |
| Modify | `src/app/(app)/store/page.tsx` | Pending-Purchases + Categories laden und übergeben |
| Create | `src/components/store/create-item-dialog.tsx` | Dialog zum Anlegen neuer Store-Artikel |
| Create | `src/components/store/pending-rewards.tsx` | Ausstehende Belohnungen anzeigen + einlösen |
| Modify | `src/app/api/store/[id]/redeem/route.ts` | Partner kann Belohnung des anderen einlösen |
| Modify | `src/app/(app)/page.tsx` | Besserer Empty-State auf Dashboard |
| Modify | `src/components/nav/navigation.tsx` | 5 Items in Mobile-Bar, Admin in Header |

---

### Task 1: Seed — Michelle + initiale Daten

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `src/tests/api/approvals.test.ts:4`

- [ ] **Step 1: Seed-Datei aktualisieren — "Partner" → "Michelle" + initiale Aufgaben und Store-Items**

Ersetze den kompletten Inhalt von `prisma/seed.ts`:

```typescript
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const pin1 = await bcrypt.hash('1234', 10)
  const pin2 = await bcrypt.hash('5678', 10)

  const franz = await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: { id: 'user-1', name: 'Franz', pin: pin1 },
  })

  const michelle = await prisma.user.upsert({
    where: { id: 'user-2' },
    update: { name: 'Michelle' },
    create: { id: 'user-2', name: 'Michelle', pin: pin2 },
  })

  const categories = [
    { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
    { id: 'cat-bath', name: 'Bad', emoji: '🚿' },
    { id: 'cat-general', name: 'Allgemein', emoji: '🏠' },
    { id: 'cat-laundry', name: 'Wäsche', emoji: '👕' },
    { id: 'cat-outdoor', name: 'Draußen', emoji: '🌿' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }

  // Initiale Aufgaben (status: 'active', da vom System angelegt)
  const tasks = [
    { id: 'task-dishes', title: 'Abwasch machen', emoji: '🍽️', points: 20, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'daily' },
    { id: 'task-cook', title: 'Kochen', emoji: '👨‍🍳', points: 40, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'daily' },
    { id: 'task-wipe-kitchen', title: 'Arbeitsflächen abwischen', emoji: '🧽', points: 15, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'daily' },
    { id: 'task-fridge', title: 'Kühlschrank aufräumen', emoji: '🧊', points: 30, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-bathroom-clean', title: 'Bad putzen', emoji: '🧹', points: 40, categoryId: 'cat-bath', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-toilet', title: 'Toilette reinigen', emoji: '🚽', points: 25, categoryId: 'cat-bath', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-mirror', title: 'Spiegel putzen', emoji: '🪞', points: 10, categoryId: 'cat-bath', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-vacuum', title: 'Staubsaugen', emoji: '🧹', points: 30, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-mop', title: 'Wischen', emoji: '🪣', points: 30, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-dust', title: 'Staubwischen', emoji: '🪶', points: 20, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-trash', title: 'Müll rausbringen', emoji: '🗑️', points: 10, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'daily' },
    { id: 'task-laundry-wash', title: 'Wäsche waschen', emoji: '🫧', points: 20, categoryId: 'cat-laundry', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-laundry-hang', title: 'Wäsche aufhängen', emoji: '👕', points: 15, categoryId: 'cat-laundry', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-laundry-fold', title: 'Wäsche zusammenlegen', emoji: '🧺', points: 15, categoryId: 'cat-laundry', isRecurring: true, recurringInterval: 'weekly' },
    { id: 'task-plants', title: 'Pflanzen gießen', emoji: '🪴', points: 10, categoryId: 'cat-outdoor', isRecurring: true, recurringInterval: 'daily' },
    { id: 'task-groceries', title: 'Einkaufen', emoji: '🛒', points: 35, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
  ]

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        ...t,
        status: 'active',
        createdById: franz.id,
        approvedById: michelle.id,
      },
    })
  }

  // Initiale Store-Items
  const storeItems = [
    { id: 'item-trophy-putzprofi', title: 'Putz-Profi', description: 'Für 50 erledigte Aufgaben', emoji: '🧹', pointCost: 500, type: 'trophy' },
    { id: 'item-trophy-kochstar', title: 'Koch-Star', description: 'Meister am Herd', emoji: '⭐', pointCost: 300, type: 'trophy' },
    { id: 'item-trophy-wochenstar', title: 'Wochen-Star', description: 'Eine ganze Woche ohne Pause', emoji: '🌟', pointCost: 700, type: 'trophy' },
    { id: 'item-trophy-earlybird', title: 'Früh-Aufsteher', description: 'Immer die erste Aufgabe des Tages', emoji: '🐦', pointCost: 400, type: 'trophy' },
    { id: 'item-reward-pizza', title: 'Pizza-Abend aussuchen', description: 'Du darfst bestimmen was bestellt wird', emoji: '🍕', pointCost: 200, type: 'real_reward' },
    { id: 'item-reward-movie', title: 'Film-Abend aussuchen', description: 'Du wählst den Film', emoji: '🎬', pointCost: 150, type: 'real_reward' },
    { id: 'item-reward-sleep', title: 'Ausschlafen', description: 'Kein Wecker, keine Pflichten am Morgen', emoji: '😴', pointCost: 250, type: 'real_reward' },
    { id: 'item-reward-massage', title: 'Massage (15 Min)', description: '15 Minuten Schulter-/Rückenmassage', emoji: '💆', pointCost: 350, type: 'real_reward' },
    { id: 'item-reward-dishfree', title: 'Abwasch-frei (1 Woche)', description: 'Eine Woche lang kein Abwasch', emoji: '✨', pointCost: 500, type: 'real_reward' },
  ]

  for (const item of storeItems) {
    await prisma.storeItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, isActive: true },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Test-Mock aktualisieren**

In `src/tests/api/approvals.test.ts`, Zeile 4: Ändere `'Partner'` → `'Michelle'`:

```typescript
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-2', name: 'Michelle' } }),
}))
```

- [ ] **Step 3: Tests laufen lassen**

Run: `npx vitest run --passWithNoTests`
Expected: Alle Tests PASS

- [ ] **Step 4: Datenbank neu seeden**

```bash
npx prisma db push --force-reset && npx prisma db seed
```

Expected: Seed läuft durch, "Michelle" als User-2, alle Tasks und Store-Items in der DB.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts src/tests/api/approvals.test.ts
git commit -m "feat: rename Partner to Michelle, add initial tasks and store items to seed"
```

---

### Task 2: Toast-Notification Komponente

**Files:**
- Create: `src/components/toast-provider.tsx`
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Toast-Provider mit Context erstellen**

Erstelle `src/components/toast-provider.tsx`:

```tsx
'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'
type Toast = {
  id: number
  message: string
  type: ToastType
  action?: { label: string; onClick: () => void }
}

type ToastContextValue = {
  toast: (message: string, type?: ToastType, action?: Toast['action']) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success', action?: Toast['action']) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type, action }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-200 ${
              t.type === 'success' ? 'bg-green-600 text-white' :
              t.type === 'error' ? 'bg-red-600 text-white' :
              'bg-slate-800 text-white'
            }`}
          >
            <span>{t.message}</span>
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); dismiss(t.id) }}
                className="font-bold underline underline-offset-2 whitespace-nowrap"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
```

- [ ] **Step 2: ToastProvider in App-Layout einbinden**

In `src/app/(app)/layout.tsx`, den ToastProvider um die Children wrappen. Die aktuelle Datei enthält die Navigation + children. Ändere sie zu:

```tsx
import { Navigation } from '@/components/nav/navigation'
import { ToastProvider } from '@/components/toast-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navigation />
      <ToastProvider>
        <main className="flex-1 p-4 pb-24 md:pb-4 max-w-2xl mx-auto w-full">
          {children}
        </main>
      </ToastProvider>
    </div>
  )
}
```

- [ ] **Step 3: Visuell testen**

Run: `npm run dev`

Öffne http://localhost:3000 — App sollte ohne Fehler laden. ToastProvider ist unsichtbar bis ein Toast gesendet wird.

- [ ] **Step 4: Commit**

```bash
git add src/components/toast-provider.tsx src/app/(app)/layout.tsx
git commit -m "feat: add toast notification system with context provider"
```

---

### Task 3: Undo für Aufgaben-Erledigung

**Files:**
- Create: `src/app/api/tasks/[id]/complete/undo/route.ts`
- Modify: `src/components/tasks/task-card.tsx`

- [ ] **Step 1: Undo-API-Endpoint erstellen**

Erstelle `src/app/api/tasks/[id]/complete/undo/route.ts`:

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

  const body = await req.json()
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
    await tx.taskCompletion.delete({ where: { id: completionId } })

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

- [ ] **Step 2: TaskCard mit Undo-Snackbar erweitern**

Ersetze den kompletten Inhalt von `src/components/tasks/task-card.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/toast-provider'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}

export function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { toast } = useToast()

  async function handleComplete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('Fehler beim Erledigen')
      const completion = await res.json()
      setDone(true)

      toast(`+${task.points} Pkt für "${task.title}"`, 'success', {
        label: 'Rückgängig',
        onClick: async () => {
          const undoRes = await fetch(`/api/tasks/${task.id}/complete/undo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completionId: completion.id }),
          })
          if (undoRes.ok) {
            setDone(false)
            toast('Erledigung rückgängig gemacht', 'info')
          }
        },
      })

      // Trigger parent refresh for points update etc.
      onComplete(task.id).catch(() => {})
    } catch {
      // API failed — keep the card visible
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
      <Button size="sm" onClick={handleComplete} disabled={loading}>
        {loading ? '…' : 'Erledigt'}
      </Button>
    </div>
  )
}
```

**Wichtig:** Da `TaskCard` jetzt selbst `fetch` aufruft und nicht mehr `onComplete` für die eigentliche Erledigung nutzt, muss `tasks-client.tsx` angepasst werden. Die `onComplete`-Prop wird nur noch für `router.refresh()` genutzt. Ändere `tasks-client.tsx` Zeile 14-17:

```typescript
  async function handleComplete(_taskId: string) {
    router.refresh()
  }
```

- [ ] **Step 3: Tests laufen lassen**

Run: `npx vitest run --passWithNoTests`
Expected: Alle Tests PASS

- [ ] **Step 4: Manuell testen**

Run: `npm run dev`

1. Öffne `/tasks`, erledige eine Aufgabe
2. Toast erscheint mit "+X Pkt für 'Aufgabe'" und "Rückgängig"-Button
3. Klicke "Rückgängig" → Aufgabe erscheint wieder, Info-Toast "Erledigung rückgängig gemacht"
4. Warte 5 Sekunden → Toast verschwindet automatisch

- [ ] **Step 5: Commit**

```bash
git add src/app/api/tasks/[id]/complete/undo/route.ts src/components/tasks/task-card.tsx src/app/(app)/tasks/tasks-client.tsx
git commit -m "feat: add undo for task completions with toast notification"
```

---

### Task 4: Inline Aufgaben-Erstellung auf /tasks

**Files:**
- Create: `src/components/tasks/create-task-dialog.tsx`
- Modify: `src/app/(app)/tasks/tasks-client.tsx`
- Modify: `src/app/(app)/tasks/page.tsx`

- [ ] **Step 1: Dialog-Komponente für neue Aufgaben erstellen**

Erstelle `src/components/tasks/create-task-dialog.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/toast-provider'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

type Category = { id: string; name: string; emoji: string }

export function CreateTaskDialog({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', emoji: '🏠', points: 30,
    categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
  })

  async function handleSubmit() {
    setError('')
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm((prev) => ({ ...prev, title: '' }))
      setOpen(false)
      router.refresh()
      toast('Aufgabe eingereicht — wartet auf Freigabe', 'success')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Anlegen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus size={16} />
          Aufgabe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Aufgabe vorschlagen</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
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
            <input type="checkbox" id="task-recurring" checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
            <Label htmlFor="task-recurring">Wiederkehrend</Label>
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button onClick={handleSubmit} disabled={!form.title || !form.categoryId} className="w-full">
            Einreichen (→ Freigabe nötig)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: TasksClient erweitern — Header mit + Button**

Ersetze den kompletten Inhalt von `src/app/(app)/tasks/tasks-client.tsx`:

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { TaskCategoryGroup } from '@/components/tasks/task-category-group'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'

type Task = {
  id: string; title: string; emoji: string; points: number
  isRecurring: boolean; recurringInterval: string | null
}
type Category = { id: string; name: string; emoji: string; tasks: Task[] }

export function TasksClient({ grouped, categories }: { grouped: Category[]; categories: Category[] }) {
  const router = useRouter()

  async function handleComplete(_taskId: string) {
    router.refresh()
  }

  const total = grouped.reduce((s, c) => s + c.tasks.length, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Aufgaben</h1>
        <CreateTaskDialog categories={categories} />
      </div>
      <p className="text-sm text-slate-500 mb-6">{total} offene Aufgaben</p>
      {total === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-slate-700">Alles erledigt!</p>
          <p className="text-sm text-slate-400 mt-1">Zeit für eine Pause — oder leg gleich neue Aufgaben an.</p>
        </div>
      )}
      {grouped.map((cat) => (
        <TaskCategoryGroup key={cat.id} category={cat} onComplete={handleComplete} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Tasks-Page — Categories an Client übergeben**

Ersetze den kompletten Inhalt von `src/app/(app)/tasks/page.tsx`:

```tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TasksClient } from './tasks-client'

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

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

  return <TasksClient grouped={grouped} categories={categories} />
}
```

- [ ] **Step 4: Manuell testen**

Run: `npm run dev`

1. Öffne `/tasks`
2. Rechts neben "Aufgaben" erscheint ein "+ Aufgabe"-Button
3. Klick öffnet Dialog mit Formular
4. Aufgabe anlegen → Toast "Aufgabe eingereicht", Dialog schließt
5. Auf `/approvals` (als anderer User): Neue Aufgabe erscheint zur Freigabe

- [ ] **Step 5: Commit**

```bash
git add src/components/tasks/create-task-dialog.tsx src/app/(app)/tasks/tasks-client.tsx src/app/(app)/tasks/page.tsx
git commit -m "feat: add inline task creation dialog on tasks page"
```

---

### Task 5: Inline Store-Item-Erstellung auf /store

**Files:**
- Create: `src/components/store/create-item-dialog.tsx`
- Modify: `src/app/(app)/store/store-client.tsx`

- [ ] **Step 1: Dialog-Komponente für neue Store-Artikel erstellen**

Erstelle `src/components/store/create-item-dialog.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/toast-provider'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export function CreateItemDialog() {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', emoji: '🎁', description: '', pointCost: 200, type: 'real_reward',
  })

  async function handleSubmit() {
    setError('')
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isActive: true }),
    })
    if (res.ok) {
      setForm((prev) => ({ ...prev, title: '', description: '' }))
      setOpen(false)
      router.refresh()
      toast('Artikel angelegt', 'success')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler beim Anlegen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus size={16} />
          Artikel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Store-Artikel</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button onClick={handleSubmit} disabled={!form.title || !form.description} className="w-full">
            Artikel anlegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: StoreClient erweitern — Header mit + Button**

Ersetze den kompletten Inhalt von `src/app/(app)/store/store-client.tsx`:

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { StoreItemCard } from '@/components/store/store-item-card'
import { CreateItemDialog } from '@/components/store/create-item-dialog'
import { useToast } from '@/components/toast-provider'
import type { StoreItem } from '@/components/store/store-item-card'

export function StoreClient({
  trophies, rewards, balance,
}: {
  trophies: StoreItem[]; rewards: StoreItem[]; balance: number
}) {
  const router = useRouter()
  const { toast } = useToast()

  async function handlePurchase(itemId: string) {
    const res = await fetch(`/api/store/${itemId}/purchase`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Fehler beim Kauf' }
    router.refresh()
    toast('Erfolgreich gekauft!', 'success')
    return {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Store</h1>
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 font-semibold">{balance.toLocaleString()} Pkt</span>
          <CreateItemDialog />
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🏆 Trophäen
      </h2>
      <div className="space-y-3 mb-8">
        {trophies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-slate-400 text-sm">Noch keine Trophäen verfügbar.</p>
            <p className="text-slate-400 text-xs mt-1">Erstelle welche über den + Button oben.</p>
          </div>
        )}
        {trophies.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🎁 Belohnungen
      </h2>
      <div className="space-y-3">
        {rewards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-slate-400 text-sm">Noch keine Belohnungen verfügbar.</p>
            <p className="text-slate-400 text-xs mt-1">Erstelle welche über den + Button oben.</p>
          </div>
        )}
        {rewards.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Manuell testen**

Run: `npm run dev`

1. Öffne `/store`
2. Rechts neben dem Punktestand erscheint ein "+ Artikel"-Button
3. Klick öffnet Dialog
4. Artikel anlegen → Toast "Artikel angelegt", Dialog schließt, Artikel erscheint in der Liste

- [ ] **Step 4: Commit**

```bash
git add src/components/store/create-item-dialog.tsx src/app/(app)/store/store-client.tsx
git commit -m "feat: add inline store item creation dialog on store page"
```

---

### Task 6: Pending Rewards — Einlöse-Flow

**Files:**
- Create: `src/components/store/pending-rewards.tsx`
- Modify: `src/app/api/store/[id]/redeem/route.ts`
- Modify: `src/app/(app)/store/page.tsx`
- Modify: `src/app/(app)/store/store-client.tsx`

- [ ] **Step 1: Redeem-API erweitern — Partner kann Belohnung des anderen einlösen**

Ersetze den kompletten Inhalt von `src/app/api/store/[id]/redeem/route.ts`:

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

  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    include: { item: { select: { type: true } } },
  })

  if (!purchase) {
    return NextResponse.json({ error: 'Kauf nicht gefunden' }, { status: 404 })
  }

  // Nur real_reward kann eingelöst werden
  if (purchase.item.type !== 'real_reward') {
    return NextResponse.json({ error: 'Trophäen werden nicht eingelöst' }, { status: 400 })
  }

  if (purchase.redeemedAt) {
    return NextResponse.json({ error: 'Bereits eingelöst' }, { status: 409 })
  }

  // Der Partner (nicht der Käufer) markiert als eingelöst
  if (purchase.userId === session.user.id) {
    return NextResponse.json({ error: 'Du kannst deine eigene Belohnung nicht einlösen — dein Partner muss das bestätigen' }, { status: 403 })
  }

  const updated = await prisma.purchase.update({
    where: { id: params.id },
    data: { redeemedAt: new Date() },
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 2: PendingRewards-Komponente erstellen**

Erstelle `src/components/store/pending-rewards.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast-provider'

type PendingPurchase = {
  id: string
  purchasedAt: string
  user: { id: string; name: string | null }
  item: { title: string; emoji: string }
}

export function PendingRewards({
  purchases,
  currentUserId,
}: {
  purchases: PendingPurchase[]
  currentUserId: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (purchases.length === 0) return null

  const mine = purchases.filter((p) => p.user.id === currentUserId)
  const theirs = purchases.filter((p) => p.user.id !== currentUserId)

  async function handleRedeem(purchaseId: string) {
    setLoadingId(purchaseId)
    const res = await fetch(`/api/store/${purchaseId}/redeem`, { method: 'POST' })
    if (res.ok) {
      toast('Belohnung als eingelöst markiert', 'success')
      router.refresh()
    } else {
      const data = await res.json()
      toast(data.error ?? 'Fehler', 'error')
    }
    setLoadingId(null)
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🎯 Offene Belohnungen
      </h2>
      <div className="space-y-2">
        {mine.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span className="text-2xl">{p.item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.item.title}</p>
              <p className="text-xs text-amber-600">Wartet auf Einlösung durch deinen Partner</p>
            </div>
          </div>
        ))}
        {theirs.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <span className="text-2xl">{p.item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.item.title}</p>
              <p className="text-xs text-green-600">{p.user.name ?? 'Unbekannt'} möchte das einlösen</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleRedeem(p.id)}
              disabled={loadingId === p.id}
            >
              {loadingId === p.id ? '…' : 'Einlösen'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Store-Page — Pending Purchases laden und übergeben**

Ersetze den kompletten Inhalt von `src/app/(app)/store/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getCurrentPoints } from '@/lib/points'
import { StoreClient } from './store-client'

export default async function StorePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const items = await prisma.storeItem.findMany({ where: { isActive: true }, orderBy: { pointCost: 'asc' } })
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

  // Alle offenen Belohnungen (eigene + die des Partners)
  const pendingPurchases = await prisma.purchase.findMany({
    where: {
      redeemedAt: null,
      item: { type: 'real_reward' },
    },
    include: {
      user: { select: { id: true, name: true } },
      item: { select: { title: true, emoji: true } },
    },
    orderBy: { purchasedAt: 'desc' },
  })

  const pendingSerialized = pendingPurchases.map((p) => ({
    id: p.id,
    purchasedAt: p.purchasedAt.toISOString(),
    user: { id: p.user.id, name: p.user.name },
    item: { title: p.item.title, emoji: p.item.emoji },
  }))

  return (
    <StoreClient
      trophies={trophies}
      rewards={rewards}
      balance={balance}
      pendingPurchases={pendingSerialized}
      currentUserId={userId}
    />
  )
}
```

- [ ] **Step 4: StoreClient — PendingRewards einbinden**

Aktualisiere `src/app/(app)/store/store-client.tsx`, um die neuen Props aufzunehmen. Ersetze den kompletten Inhalt:

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { StoreItemCard } from '@/components/store/store-item-card'
import { CreateItemDialog } from '@/components/store/create-item-dialog'
import { PendingRewards } from '@/components/store/pending-rewards'
import { useToast } from '@/components/toast-provider'
import type { StoreItem } from '@/components/store/store-item-card'

type PendingPurchase = {
  id: string
  purchasedAt: string
  user: { id: string; name: string | null }
  item: { title: string; emoji: string }
}

export function StoreClient({
  trophies, rewards, balance, pendingPurchases, currentUserId,
}: {
  trophies: StoreItem[]; rewards: StoreItem[]; balance: number
  pendingPurchases: PendingPurchase[]; currentUserId: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  async function handlePurchase(itemId: string) {
    const res = await fetch(`/api/store/${itemId}/purchase`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Fehler beim Kauf' }
    router.refresh()
    toast('Erfolgreich gekauft!', 'success')
    return {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Store</h1>
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 font-semibold">{balance.toLocaleString()} Pkt</span>
          <CreateItemDialog />
        </div>
      </div>

      <PendingRewards purchases={pendingPurchases} currentUserId={currentUserId} />

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🏆 Trophäen
      </h2>
      <div className="space-y-3 mb-8">
        {trophies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-slate-400 text-sm">Noch keine Trophäen verfügbar.</p>
            <p className="text-slate-400 text-xs mt-1">Erstelle welche über den + Button oben.</p>
          </div>
        )}
        {trophies.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🎁 Belohnungen
      </h2>
      <div className="space-y-3">
        {rewards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-slate-400 text-sm">Noch keine Belohnungen verfügbar.</p>
            <p className="text-slate-400 text-xs mt-1">Erstelle welche über den + Button oben.</p>
          </div>
        )}
        {rewards.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Manuell testen**

Run: `npm run dev`

1. Als Franz: Im Store eine Belohnung kaufen (z.B. "Pizza-Abend aussuchen")
2. Unter "Offene Belohnungen" erscheint sie mit "Wartet auf Einlösung durch deinen Partner"
3. Als Michelle einloggen: Im Store sieht man "Franz möchte das einlösen" mit "Einlösen"-Button
4. Klick auf "Einlösen" → Toast "Belohnung als eingelöst markiert", verschwindet aus der Liste

- [ ] **Step 6: Commit**

```bash
git add src/components/store/pending-rewards.tsx src/app/api/store/[id]/redeem/route.ts src/app/(app)/store/page.tsx src/app/(app)/store/store-client.tsx
git commit -m "feat: add pending rewards section with partner redemption flow"
```

---

### Task 7: Bessere Empty-States

**Files:**
- Modify: `src/app/(app)/page.tsx`
- Modify: `src/app/(app)/approvals/approvals-client.tsx`

- [ ] **Step 1: Dashboard — motivierender Empty-State**

In `src/app/(app)/page.tsx`, ersetze den bestehenden Empty-State (Zeilen 52-54):

Alt:
```tsx
          <p className="text-slate-400 text-sm text-center py-8">
            Noch keine Aktivitäten. Erledige die erste Aufgabe!
          </p>
```

Neu:
```tsx
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-lg font-semibold text-slate-700">Noch keine Aktivitäten</p>
            <p className="text-sm text-slate-400 mt-1">
              Erledige deine erste Aufgabe und starte das Spiel!
            </p>
          </div>
```

- [ ] **Step 2: Approvals — freundlicher Empty-State**

In `src/app/(app)/approvals/approvals-client.tsx`, ersetze den Empty-State (Zeilen 25-28):

Alt:
```tsx
        <p className="text-center text-slate-400 py-12">
          ✅ Keine offenen Anfragen
        </p>
```

Neu:
```tsx
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-slate-700">Alles freigegeben</p>
          <p className="text-sm text-slate-400 mt-1">
            Keine offenen Anfragen — wenn jemand eine neue Aufgabe vorschlägt, erscheint sie hier.
          </p>
        </div>
```

- [ ] **Step 3: Tests laufen lassen**

Run: `npx vitest run --passWithNoTests`
Expected: Alle Tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/page.tsx src/app/(app)/approvals/approvals-client.tsx
git commit -m "feat: improve empty states with motivating messages and visual cues"
```

---

### Task 8: Mobile Navigation — 5 Items + Admin-Zugang

**Files:**
- Modify: `src/components/nav/navigation.tsx`

- [ ] **Step 1: Navigation umbauen — 5 Items in Mobile-Bar, Admin nur Desktop + als Icon in Mobile-Header**

Ersetze den kompletten Inhalt von `src/components/nav/navigation.tsx`:

```tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, BarChart2, Shield, Settings } from 'lucide-react'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

const MAIN_NAV = [
  { href: '/',           icon: Home,         label: 'Home' },
  { href: '/tasks',      icon: CheckSquare,  label: 'Aufgaben' },
  { href: '/store',      icon: ShoppingBag,  label: 'Store' },
  { href: '/stats',      icon: BarChart2,    label: 'Statistik' },
  { href: '/approvals',  icon: Shield,       label: 'Freigaben' },
]

export function Navigation() {
  const pathname = usePathname()
  const [approvalCount, setApprovalCount] = useState(0)

  useEffect(() => {
    fetch('/api/approvals/count')
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setApprovalCount(d.count ?? 0))
      .catch(() => {})
  }, [pathname])

  return (
    <>
      {/* Mobile top bar with admin access */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-2 md:hidden z-50">
        <span className="text-sm font-bold">🏠 Haushalt-Quest</span>
        <Link
          href="/admin"
          aria-current={isActive(pathname, '/admin') ? 'page' : undefined}
          className={`p-2 rounded-lg transition-colors ${
            isActive(pathname, '/admin') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Settings size={20} />
        </Link>
      </header>

      {/* Mobile bottom bar — 5 items */}
      <nav aria-label="Hauptnavigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-50">
        {MAIN_NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors relative ${
              isActive(pathname, href) ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <span className="relative">
              <Icon size={20} />
              {href === '/approvals' && approvalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-xs bg-red-500 text-white rounded-full px-1 min-w-4 text-center leading-4">
                  {approvalCount > 9 ? '9+' : approvalCount}
                </span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar — all 6 items */}
      <nav aria-label="Seitenleiste" className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-3">🏠 Haushalt-Quest</div>
        {[...MAIN_NAV, { href: '/admin', icon: Settings, label: 'Admin' }].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(pathname, href)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon size={18} />
            {label}
            {href === '/approvals' && approvalCount > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {approvalCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  )
}
```

- [ ] **Step 2: App-Layout — Padding für Mobile-Header anpassen**

In `src/app/(app)/layout.tsx`, füge `pt-14` für den mobilen Header hinzu:

```tsx
import { Navigation } from '@/components/nav/navigation'
import { ToastProvider } from '@/components/toast-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navigation />
      <ToastProvider>
        <main className="flex-1 p-4 pt-16 pb-24 md:pt-4 md:pb-4 max-w-2xl mx-auto w-full">
          {children}
        </main>
      </ToastProvider>
    </div>
  )
}
```

- [ ] **Step 3: Manuell testen**

Run: `npm run dev`

1. Mobile-Ansicht (DevTools): Bottom-Bar hat 5 Items (Home, Aufgaben, Store, Statistik, Freigaben)
2. Oben rechts: Settings-Icon führt zu /admin
3. Desktop-Ansicht: Sidebar hat alle 6 Items inkl. Admin
4. Approval-Badge erscheint weiterhin korrekt

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/navigation.tsx src/app/(app)/layout.tsx
git commit -m "feat: optimize mobile nav to 5 items, move admin to top bar"
```

---

## Self-Review Checklist

**Spec coverage:** Alle 8 besprochenen Punkte abgedeckt:
1. ✅ "Partner" → "Michelle" (Task 1)
2. ✅ Initiale Seed-Daten mit Aufgaben + Store-Items (Task 1)
3. ✅ Inline Aufgaben-Erstellung auf /tasks (Task 4)
4. ✅ Inline Store-Item-Erstellung auf /store (Task 5)
5. ✅ Toast-Feedback bei Aktionen (Task 2, verwendet in Tasks 3-6)
6. ✅ Undo für versehentliche Erledigungen (Task 3)
7. ✅ Pending Rewards + Einlöse-Flow (Task 6)
8. ✅ Bessere Empty-States (Task 7, plus inline in Tasks 4-5)
9. ✅ Mobile Nav Optimierung (Task 8)

**Placeholder scan:** Keine TBDs, TODOs oder vagen Anweisungen. Alle Steps enthalten vollständigen Code.

**Type consistency:** `StoreItem`, `Category`, `Toast`, `PendingPurchase` Typen konsistent über alle Tasks. `useToast()` hook wird ab Task 2 in allen folgenden Tasks verwendet.
