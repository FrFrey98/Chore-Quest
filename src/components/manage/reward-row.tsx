'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { useToast } from '@/components/toast-provider'
import { ConfirmDialog } from '@/components/manage/confirm-dialog'
import { Pencil, Trash2, RotateCcw, Check, X } from 'lucide-react'

type Reward = {
  id: string
  title: string
  emoji: string
  description: string
  pointCost: number
  isActive: boolean
}

type RewardRowProps = {
  reward: Reward
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}

export function RewardRow({ reward, isEditing, onStartEdit, onCancelEdit }: RewardRowProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    title: reward.title,
    emoji: reward.emoji,
    description: reward.description,
    pointCost: reward.pointCost,
    isActive: reward.isActive,
  })
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/store/${reward.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast('Belohnung gespeichert', 'success')
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

  async function handleDeactivate() {
    setArchiving(true)
    try {
      const res = await fetch(`/api/store/${reward.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Belohnung deaktiviert', 'success')
        setConfirmOpen(false)
        router.refresh()
      } else {
        toast('Fehler beim Deaktivieren', 'error')
      }
    } catch {
      toast('Netzwerkfehler', 'error')
    } finally {
      setArchiving(false)
    }
  }

  async function handleReactivate() {
    setSaving(true)
    try {
      const res = await fetch(`/api/store/${reward.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })
      if (res.ok) {
        toast('Belohnung reaktiviert', 'success')
        router.refresh()
      } else {
        toast('Fehler beim Reaktivieren', 'error')
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
            <label className="text-xs text-slate-500 mb-1 block">Preis (Pkt)</label>
            <Input type="number" value={form.pointCost} onChange={(e) => setForm({ ...form, pointCost: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Titel</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Beschreibung</label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`active-${reward.id}`}
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor={`active-${reward.id}`} className="text-sm">Aktiv</label>
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

  const truncatedDesc = reward.description.length > 50
    ? reward.description.slice(0, 50) + '…'
    : reward.description

  return (
    <>
      <div className={`flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 ${!reward.isActive ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">{reward.emoji}</span>
          <span className="text-sm font-medium text-slate-700 truncate">{reward.title}</span>
          {truncatedDesc && (
            <span className="text-xs text-slate-400 truncate hidden sm:inline">{truncatedDesc}</span>
          )}
          <span className="text-xs text-slate-400 shrink-0">{reward.pointCost} Pkt</span>
          {!reward.isActive && (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
              Inaktiv
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
          {!reward.isActive ? (
            <button
              type="button"
              onClick={handleReactivate}
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
        title="Belohnung deaktivieren"
        description={`Belohnung "${reward.title}" wirklich deaktivieren?`}
        confirmLabel="Ja, deaktivieren"
        onConfirm={handleDeactivate}
        loading={archiving}
      />
    </>
  )
}
