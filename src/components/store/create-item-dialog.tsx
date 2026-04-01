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
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', emoji: '🎁', description: '', pointCost: 200,
  })

  async function handleSubmit() {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isActive: true }),
      })
      if (res.ok) {
        setForm((prev) => ({ ...prev, title: '', description: '' }))
        setOpen(false)
        router.refresh()
        toast('Belohnung angelegt', 'success')
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
          Belohnung
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Belohnung</DialogTitle>
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.description} className="w-full">
            Belohnung anlegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
