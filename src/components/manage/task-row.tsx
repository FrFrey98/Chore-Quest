'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { useToast } from '@/components/toast-provider'
import { ConfirmDialog } from '@/components/manage/confirm-dialog'
import { Pencil, Trash2, RotateCcw, Check, X } from 'lucide-react'

type Category = { id: string; name: string; emoji: string }

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

type TaskRowProps = {
  task: Task
  categories: Category[]
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending_approval: { label: 'Wartend', className: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'Abgelehnt', className: 'bg-red-100 text-red-700' },
  archived: { label: 'Archiviert', className: 'bg-slate-100 text-slate-500' },
}

export function TaskRow({ task, categories, isEditing, onStartEdit, onCancelEdit }: TaskRowProps) {
  const router = useRouter()
  const { toast } = useToast()
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
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const isInactive = task.status === 'archived' || task.status === 'rejected'
  const badge = STATUS_BADGES[task.status]
  const category = categories.find((c) => c.id === task.categoryId)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          recurringInterval: form.isRecurring ? form.recurringInterval : null,
          dailyLimit: form.allowMultiple ? form.dailyLimit : null,
        }),
      })
      if (res.ok) {
        toast('Aufgabe gespeichert', 'success')
        onCancelEdit()
        router.refresh()
      } else {
        const data = await res.json()
        toast(data.error ?? 'Fehler beim Speichern', 'error')
      }
    } catch {
      toast('Netzwerkfehler', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Aufgabe archiviert', 'success')
        setConfirmOpen(false)
        router.refresh()
      } else {
        toast('Fehler beim Archivieren', 'error')
      }
    } catch {
      toast('Netzwerkfehler', 'error')
    } finally {
      setArchiving(false)
    }
  }

  async function handleRestore() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      if (res.ok) {
        toast('Aufgabe wiederhergestellt', 'success')
        router.refresh()
      } else {
        toast('Fehler beim Wiederherstellen', 'error')
      }
    } catch {
      toast('Netzwerkfehler', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white border border-indigo-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Emoji</label>
            <EmojiPicker value={form.emoji} onChange={(emoji) => setForm({ ...form, emoji })} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Punkte</label>
            <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Titel</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Kategorie</label>
            <select
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Status</label>
            <select
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Aktiv</option>
              <option value="archived">Archiviert</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`recurring-${task.id}`}
            checked={form.isRecurring}
            onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
          />
          <label htmlFor={`recurring-${task.id}`} className="text-sm">Wiederkehrend</label>
          {form.isRecurring && (
            <select
              className="border border-slate-200 rounded-md px-2 py-1 text-sm"
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            disabled={saving}
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
            disabled={saving || !form.title}
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 ${isInactive ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">{task.emoji}</span>
          <span className="text-sm font-medium text-slate-700 truncate">{task.title}</span>
          <span className="text-xs text-slate-400 shrink-0">{task.points} Pkt</span>
          {category && (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
              {category.emoji} {category.name}
            </span>
          )}
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={onStartEdit}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          {(task.status === 'archived' || task.status === 'rejected') ? (
            <button
              type="button"
              onClick={handleRestore}
              className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              disabled={saving}
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Aufgabe archivieren"
        description={`Aufgabe "${task.title}" wirklich archivieren?`}
        confirmLabel="Ja, archivieren"
        onConfirm={handleArchive}
        loading={archiving}
      />
    </>
  )
}
