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
