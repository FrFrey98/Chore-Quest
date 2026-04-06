'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/toast-provider'
import { EmojiPicker } from '@/components/ui/emoji-picker'
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
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', emoji: '🏠', points: 30,
    categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
    allowMultiple: false, dailyLimit: 3,
    scheduleDays: '' as string,
    scheduleTime: '' as string,
  })

  async function handleSubmit() {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          scheduleDays: form.scheduleDays || null,
          scheduleTime: form.scheduleTime || null,
          recurringInterval: form.scheduleDays ? null : form.recurringInterval,
        }),
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
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen')
    } finally {
      setSubmitting(false)
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
              <EmojiPicker value={form.emoji} onChange={(emoji) => setForm({ ...form, emoji })} />
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
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="task-recurring" checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked, scheduleDays: '' })} />
              <Label htmlFor="task-recurring">Wiederkehrend</Label>
              {form.isRecurring && !form.scheduleDays && (
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={form.recurringInterval}
                  onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="monthly">Monatlich</option>
                  <option value="custom">Bestimmte Tage…</option>
                </select>
              )}
            </div>
            {form.isRecurring && (form.recurringInterval === 'custom' || form.scheduleDays) && (
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: 'mon', label: 'Mo' }, { key: 'tue', label: 'Di' },
                  { key: 'wed', label: 'Mi' }, { key: 'thu', label: 'Do' },
                  { key: 'fri', label: 'Fr' }, { key: 'sat', label: 'Sa' },
                  { key: 'sun', label: 'So' },
                ].map(({ key, label }) => {
                  const days = form.scheduleDays ? form.scheduleDays.split(',') : []
                  const isActive = days.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const newDays = isActive
                          ? days.filter((d) => d !== key)
                          : [...days, key]
                        setForm({ ...form, scheduleDays: newDays.join(',') })
                      }}
                      className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
            {form.isRecurring && (
              <div className="flex items-center gap-2">
                <Label htmlFor="task-schedule-time">Erinnerung</Label>
                <input
                  type="time"
                  id="task-schedule-time"
                  value={form.scheduleTime}
                  onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                  className="border rounded-md px-2 py-1 text-sm"
                />
              </div>
            )}
          </div>
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.categoryId} className="w-full">
            Einreichen (→ Freigabe nötig)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
