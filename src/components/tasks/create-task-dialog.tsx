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
