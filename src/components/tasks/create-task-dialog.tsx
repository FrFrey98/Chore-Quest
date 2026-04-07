'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
type UserItem = { id: string; name: string }

const WEEKDAY_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'] as const
const WEEKDAY_VALUES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function CreateTaskDialog({ categories, users, userRole }: {
  categories: Category[]; users?: UserItem[]; userRole?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('tasks.createDialog')
  const tc = useTranslations('common')
  const tIntervals = useTranslations('intervals')
  const tWeekdays = useTranslations('weekdays')
  const tt = useTranslations('tasks')
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
    assignedUserIds: [] as string[],
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
          ...(form.assignedUserIds.length ? { assignedUserIds: form.assignedUserIds } : {}),
        }),
      })
      if (res.ok) {
        setForm((prev) => ({ ...prev, title: '' }))
        setOpen(false)
        router.refresh()
        toast(t('submitted'), 'success')
      } else {
        const data = await res.json()
        setError(data.error ?? t('createFailed'))
      }
    } catch {
      setError(tc('networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus size={16} />
          {tt('task')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('emoji')}</Label>
              <EmojiPicker value={form.emoji} onChange={(emoji) => setForm({ ...form, emoji })} />
            </div>
            <div>
              <Label>{t('pointsLabel')}</Label>
              <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>{t('titleLabel')}</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>{t('category')}</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          {users && users.length > 0 && (
            <div>
              <Label>{t('assignedTo')}</Label>
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
                        active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
              <input type="checkbox" id="task-recurring" checked={form.isRecurring}
                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked, scheduleDays: '' })} />
              <Label htmlFor="task-recurring">{t('recurring')}</Label>
              {form.isRecurring && !form.scheduleDays && (
                <select
                  className="border rounded-md px-2 py-1 text-sm"
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
                {WEEKDAY_VALUES.map((key, idx) => {
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
                      {tWeekdays(WEEKDAY_KEYS[idx])}
                    </button>
                  )
                })}
              </div>
            )}
            {form.isRecurring && (
              <div className="flex items-center gap-2">
                <Label htmlFor="task-schedule-time">{t('reminder')}</Label>
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
            <Label htmlFor="task-multi">{t('multiplePerDay')}</Label>
            {form.allowMultiple && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500">{t('max')}</span>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  className="w-16"
                  value={form.dailyLimit}
                  onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })}
                />
                <span className="text-sm text-slate-500">{t('perDay')}</span>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.categoryId} className="w-full">
            {t('submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
