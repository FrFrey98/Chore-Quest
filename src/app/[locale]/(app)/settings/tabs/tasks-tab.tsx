'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TemplatePicker } from '@/components/tasks/template-picker'

type Category = { id: string; name: string; emoji: string; taskCount: number }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: { id: string; name: string; emoji: string } }
type UserItem = { id: string; name: string }

export function TasksTab({ tasks, categories, users, userId }: { tasks: Task[]; categories: Category[]; users?: UserItem[]; userId: string }) {
  const router = useRouter()
  const t = useTranslations('settings.tasks')
  const ti = useTranslations('intervals')
  const tw = useTranslations('weekdays')
  const tTpl = useTranslations('templates')
  const [error, setError] = useState('')
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const [form, setForm] = useState({
    title: '', emoji: '🏠', points: 30, categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
    allowMultiple: false, dailyLimit: 3,
    scheduleDays: '' as string,
    scheduleTime: '' as string,
    assignedUserIds: [] as string[],
  })

  async function createTask() {
    setError('')
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
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? t('createFailed'))
    }
  }

  async function archiveTask(id: string) {
    setError('')
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? t('archiveFailed'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t('newHeading')}</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
            {tTpl('useTemplate')}
          </Button>
        </div>
        <TemplatePicker
          open={templatePickerOpen}
          onClose={() => setTemplatePickerOpen(false)}
          onSelect={(tpl) => {
            setForm((prev) => ({
              ...prev,
              title: tpl.title,
              emoji: tpl.emoji,
              points: tpl.points,
              isRecurring: tpl.interval !== 'once',
              recurringInterval: tpl.interval === 'once' ? 'weekly' : tpl.interval,
            }))
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('emoji')}</Label>
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          </div>
          <div>
            <Label>{t('points')}</Label>
            <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label>{t('title')}</Label>
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
            <div className="flex gap-1 flex-wrap mt-1">
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
                      active ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
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
            <input type="checkbox" id="recurring" checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked, scheduleDays: '' })} />
            <Label htmlFor="recurring">{t('recurring')}</Label>
            {form.isRecurring && !form.scheduleDays && (
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={form.recurringInterval}
                onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
              >
                <option value="daily">{ti('daily')}</option>
                <option value="weekly">{ti('weekly')}</option>
                <option value="monthly">{ti('monthly')}</option>
                <option value="custom">{ti('customDays')}</option>
              </select>
            )}
          </div>
          {form.isRecurring && (form.recurringInterval === 'custom' || form.scheduleDays) && (
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'mon', label: tw('mo') }, { key: 'tue', label: tw('tu') },
                { key: 'wed', label: tw('we') }, { key: 'thu', label: tw('th') },
                { key: 'fri', label: tw('fr') }, { key: 'sat', label: tw('sa') },
                { key: 'sun', label: tw('su') },
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
                      isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
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
              <Label htmlFor="schedule-time">{t('reminder')}</Label>
              <input
                type="time"
                id="schedule-time"
                value={form.scheduleTime}
                onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                className="border rounded-md px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="allowMultiple" checked={form.allowMultiple}
            onChange={(e) => setForm({ ...form, allowMultiple: e.target.checked })} />
          <Label htmlFor="allowMultiple">{t('multiplePerDay')}</Label>
          {form.allowMultiple && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">{t('max')}</span>
              <Input type="number" className="w-16" value={form.dailyLimit}
                onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })} />
              <span className="text-sm text-muted-foreground">{t('perDay')}</span>
            </div>
          )}
        </div>
        <Button onClick={createTask} disabled={!form.title || !form.categoryId}>
          {t('submitButton')}
        </Button>
        {error && <p className="text-danger text-xs">{error}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('activeCount', { count: tasks.length })}</h2>
        <Link href="/manage" className="text-xs text-accent hover:text-accent-hover">{t('editLink')}</Link>
      </div>
      <div className="space-y-2">
        {tasks.map((tk) => (
          <div key={tk.id} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-sm">
            <span>{tk.emoji}</span>
            <span className="flex-1 text-sm">{tk.title}</span>
            <span className="text-xs text-muted-foreground">{tk.status}</span>
            <Button variant="outline" size="sm" onClick={() => archiveTask(tk.id)}>{t('archive')}</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
