'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Achievement = {
  id: string; title: string; description: string; emoji: string
  conditionType: string; conditionValue: number; conditionMeta: string | null; sortOrder: number
}
type Category = { id: string; name: string; emoji: string; taskCount: number }

const CONDITION_TYPES = ['task_count', 'category_count', 'streak_days', 'total_points', 'level']

export function AchievementsTab({ achievements: initial, categories }: { achievements: Achievement[]; categories: Category[] }) {
  const router = useRouter()
  const t = useTranslations('settings.achievements')
  const tc = useTranslations('common')
  const [achievements, setAchievements] = useState(initial)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Achievement>>({})
  const [msg, setMsg] = useState('')

  function startEdit(ach: Achievement) {
    setEditId(ach.id)
    setForm({ ...ach })
  }

  function startCreate() {
    setEditId('new')
    setForm({ emoji: '⭐', title: '', description: '', conditionType: 'task_count', conditionValue: 1, conditionMeta: null, sortOrder: achievements.length + 1 })
  }

  function cancel() {
    setEditId(null)
    setForm({})
  }

  async function save() {
    if (!form.title || !form.emoji || !form.conditionType || form.conditionValue == null) return
    setMsg('')
    const isNew = editId === 'new'
    const url = isNew ? '/api/settings/achievements' : `/api/settings/achievements/${editId}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setEditId(null)
      setForm({})
      setMsg(isNew ? t('created') : tc('saved'))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? tc('error'))
    }
  }

  async function deleteAch(id: string) {
    setMsg('')
    const res = await fetch(`/api/settings/achievements/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAchievements((prev) => prev.filter((a) => a.id !== id))
      setMsg(t('deleted'))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? tc('error'))
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('description')}</p>

      {editId && (
        <div className="bg-card rounded-xl p-4 shadow-sm space-y-3 border-2 border-accent/20">
          <h3 className="font-semibold text-sm">{editId === 'new' ? t('newHeading') : t('editHeading')}</h3>
          <div className="flex gap-2">
            <Input className="w-14 text-center text-lg" placeholder={t('emojiPlaceholder')} value={form.emoji ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))} />
            <Input className="flex-1" placeholder={t('titlePlaceholder')} value={form.title ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <Input placeholder={t('descriptionPlaceholder')} value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="flex gap-2 flex-wrap items-center">
            <select
              className="border rounded-md px-2 py-1.5 text-sm"
              value={form.conditionType ?? 'task_count'}
              onChange={(e) => setForm((prev) => ({ ...prev, conditionType: e.target.value, conditionMeta: null }))}
            >
              {CONDITION_TYPES.map((ct) => (
                <option key={ct} value={ct}>{t(`conditionTypes.${ct}` as Parameters<typeof t>[0])}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">≥</span>
            <Input type="number" className="w-20 text-center" value={form.conditionValue ?? 1} onChange={(e) => setForm((prev) => ({ ...prev, conditionValue: Number(e.target.value) }))} />
            {form.conditionType === 'category_count' && (
              <select
                className="border rounded-md px-2 py-1.5 text-sm"
                value={form.conditionMeta ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, conditionMeta: e.target.value || null }))}
              >
                <option value="">{t('categorySelect')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            )}
            <label className="text-xs text-muted-foreground ml-auto">{t('sortOrder')}</label>
            <Input type="number" className="w-14 text-center" value={form.sortOrder ?? 0} onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={cancel}>{tc('cancel')}</Button>
            <Button onClick={save}>{tc('save')}</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {achievements.map((ach) => (
          <div key={ach.id} className="bg-card rounded-lg p-3 shadow-sm flex gap-2 items-center">
            <span className="text-lg w-8 text-center">{ach.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ach.title}</p>
              <p className="text-xs text-muted-foreground">{t(`conditionTypes.${ach.conditionType}` as Parameters<typeof t>[0])} ≥ {ach.conditionValue}</p>
            </div>
            <button onClick={() => startEdit(ach)} className="text-muted-foreground hover:text-muted-foreground text-sm">✏️</button>
            <button onClick={() => deleteAch(ach.id)} className="text-danger hover:text-danger text-lg px-1">×</button>
          </div>
        ))}
      </div>

      {!editId && (
        <Button variant="outline" className="w-full" onClick={startCreate}>{t('addButton')}</Button>
      )}

      <div className="p-3 bg-accent/10 rounded-lg text-xs text-accent">
        {t('info')}
      </div>

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  )
}
