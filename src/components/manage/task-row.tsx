'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { useToast } from '@/components/toast-provider'
import { ConfirmDialog } from '@/components/manage/confirm-dialog'
import { Pencil, Trash2, RotateCcw, Check, X } from 'lucide-react'

type Category = { id: string; name: string; emoji: string }
type UserItem = { id: string; name: string }

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
  scheduleDays: string | null
  scheduleTime: string | null
  assignedUserIds?: string[]
  decayHours?: number | null
}

type TaskRowProps = {
  task: Task
  categories: Category[]
  users?: UserItem[]
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}

export function TaskRow({ task, categories, users, isEditing, onStartEdit, onCancelEdit }: TaskRowProps) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('manage.taskRow')
  const tc = useTranslations('common')
  const tIntervals = useTranslations('intervals')
  const tWeekdays = useTranslations('weekdays')
  const tTasks = useTranslations('tasks.createDialog')

  const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    pending_approval: { label: t('waiting'), className: 'bg-amber-100 text-amber-700' },
    rejected: { label: t('rejected'), className: 'bg-red-100 text-red-700' },
    archived: { label: t('archived'), className: 'bg-muted text-muted-foreground' },
  }
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
    scheduleDays: task.scheduleDays ?? '',
    scheduleTime: task.scheduleTime ?? '',
    assignedUserIds: task.assignedUserIds ?? [],
    decayHours: task.decayHours ?? null,
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
          recurringInterval: form.scheduleDays ? null : (form.isRecurring ? form.recurringInterval : null),
          dailyLimit: form.allowMultiple ? form.dailyLimit : null,
          scheduleDays: form.scheduleDays || null,
          scheduleTime: form.scheduleTime || null,
          assignedUserIds: form.assignedUserIds,
          decayHours: form.isRecurring && form.decayHours ? form.decayHours : null,
        }),
      })
      if (res.ok) {
        toast(t('saved'), 'success')
        onCancelEdit()
        router.refresh()
      } else {
        const data = await res.json()
        toast(data.error ?? t('saveFailed'), 'error')
      }
    } catch {
      toast(tc('networkError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast(t('taskArchived'), 'success')
        setConfirmOpen(false)
        router.refresh()
      } else {
        toast(t('archiveFailed'), 'error')
      }
    } catch {
      toast(tc('networkError'), 'error')
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
        toast(t('taskRestored'), 'success')
        router.refresh()
      } else {
        toast(t('restoreFailed'), 'error')
      }
    } catch {
      toast(tc('networkError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-card border border-indigo-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{tTasks('emoji')}</label>
            <EmojiPicker value={form.emoji} onChange={(emoji) => setForm({ ...form, emoji })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{tTasks('pointsLabel')}</label>
            <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{tTasks('titleLabel')}</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{tTasks('category')}</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">{t('active')}</option>
              <option value="archived">{t('archived')}</option>
            </select>
          </div>
        </div>
        {users && users.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{tTasks('assignedTo')}</label>
            <div className="flex gap-1 flex-wrap">
              {users.map((u) => {
                const active = form.assignedUserIds.includes(u.id)
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        assignedUserIds: active
                          ? prev.assignedUserIds.filter((id) => id !== u.id)
                          : [...prev.assignedUserIds, u.id],
                      }))
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {u.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`recurring-${task.id}`}
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked, scheduleDays: '' })}
            />
            <label htmlFor={`recurring-${task.id}`} className="text-sm">{tTasks('recurring')}</label>
            {form.isRecurring && !form.scheduleDays && (
              <select
                className="border border-border rounded-md px-2 py-1 text-sm"
                value={form.recurringInterval}
                onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
              >
                <option value="daily">{tIntervals('daily')}</option>
                <option value="weekly">{tIntervals('weekly')}</option>
                <option value="monthly">{tIntervals('monthly')}</option>
                <option value="custom">{tIntervals('customDays')}</option>
              </select>
            )}
          </div>
          {form.isRecurring && (form.recurringInterval === 'custom' || form.scheduleDays) && (
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'mon', label: tWeekdays('mo') }, { key: 'tue', label: tWeekdays('tu') },
                { key: 'wed', label: tWeekdays('we') }, { key: 'thu', label: tWeekdays('th') },
                { key: 'fri', label: tWeekdays('fr') }, { key: 'sat', label: tWeekdays('sa') },
                { key: 'sun', label: tWeekdays('su') },
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
                      isActive ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
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
              <label htmlFor={`schedule-time-${task.id}`} className="text-sm">{tTasks('reminder')}</label>
              <input
                type="time"
                id={`schedule-time-${task.id}`}
                value={form.scheduleTime}
                onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                className="border border-border rounded-md px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
        {form.isRecurring && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`decay-override-${task.id}`}
              checked={form.decayHours !== null}
              onChange={(e) => setForm({ ...form, decayHours: e.target.checked ? 48 : null })}
            />
            <label htmlFor={`decay-override-${task.id}`} className="text-sm">{t('decayHoursOverride')}</label>
            {form.decayHours !== null && (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={form.decayHours}
                  onChange={(e) => setForm({ ...form, decayHours: Number(e.target.value) })}
                />
                <span className="text-xs text-muted-foreground">h</span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`multi-${task.id}`}
            checked={form.allowMultiple}
            onChange={(e) => setForm({ ...form, allowMultiple: e.target.checked })}
          />
          <label htmlFor={`multi-${task.id}`} className="text-sm">{tTasks('multiplePerDay')}</label>
          {form.allowMultiple && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{tTasks('max')}</span>
              <Input
                type="number"
                min={2}
                max={10}
                className="w-16"
                value={form.dailyLimit}
                onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })}
              />
              <span className="text-xs text-muted-foreground">{tTasks('perDay')}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
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
      <div className={`flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 ${isInactive ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">{task.emoji}</span>
          <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
          <span className="text-xs text-muted-foreground shrink-0">{task.points} {tc('points')}</span>
          {category && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
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
            className="p-2 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          {(task.status === 'archived' || task.status === 'rejected') ? (
            <button
              type="button"
              onClick={handleRestore}
              className="p-2 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
              disabled={saving}
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('archiveTitle')}
        description={t('archiveDescription', { title: task.title })}
        confirmLabel={t('archiveConfirm')}
        onConfirm={handleArchive}
        loading={archiving}
      />
    </>
  )
}
