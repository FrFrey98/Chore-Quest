'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Category = { id: string; name: string; emoji: string; taskCount: number }

export function CategoriesTab({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const t = useTranslations('settings.categories')
  const tc = useTranslations('common')
  const [categories, setCategories] = useState(initial)
  const [edits, setEdits] = useState<Record<string, { name: string; emoji: string }>>({})
  const [newCat, setNewCat] = useState({ name: '', emoji: '📁' })
  const [msg, setMsg] = useState('')

  function startEdit(cat: Category) {
    setEdits((prev) => ({ ...prev, [cat.id]: { name: cat.name, emoji: cat.emoji } }))
  }

  function cancelEdit(id: string) {
    setEdits((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  async function saveEdit(id: string) {
    const edit = edits[id]
    if (!edit) return
    setMsg('')
    const res = await fetch(`/api/settings/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    })
    if (res.ok) {
      cancelEdit(id)
      setMsg(tc('saved'))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? tc('error'))
    }
  }

  async function deleteCat(id: string) {
    setMsg('')
    const res = await fetch(`/api/settings/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setMsg(t('deleted'))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? tc('error'))
    }
  }

  async function createCat() {
    if (!newCat.name.trim() || !newCat.emoji.trim()) return
    setMsg('')
    const res = await fetch('/api/settings/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    })
    if (res.ok) {
      setNewCat({ name: '', emoji: '📁' })
      setMsg(tc('saved'))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? tc('error'))
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <div className="space-y-2">
        {categories.map((cat) => {
          const edit = edits[cat.id]
          return (
            <div key={cat.id} className="bg-card rounded-lg p-3 shadow-sm flex gap-2 items-center">
              {edit ? (
                <>
                  <Input className="w-12 text-center text-lg" value={edit.emoji} onChange={(e) => setEdits((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], emoji: e.target.value } }))} />
                  <Input className="flex-1" value={edit.name} onChange={(e) => setEdits((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], name: e.target.value } }))} />
                  <Button size="sm" onClick={() => saveEdit(cat.id)}>✓</Button>
                  <button onClick={() => cancelEdit(cat.id)} className="text-muted-foreground px-1">✕</button>
                </>
              ) : (
                <>
                  <span className="text-lg w-8 text-center">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{t('taskCount', { count: cat.taskCount })}</span>
                  <button onClick={() => startEdit(cat)} className="text-muted-foreground hover:text-muted-foreground text-sm">✏️</button>
                  <button
                    onClick={() => deleteCat(cat.id)}
                    disabled={cat.taskCount > 0}
                    className={`text-lg px-1 ${cat.taskCount > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                    title={cat.taskCount > 0 ? t('moveFirst') : t('deleteTooltip')}
                  >×</button>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-3 flex gap-2 items-center">
        <Input className="w-12 text-center text-lg" value={newCat.emoji} onChange={(e) => setNewCat((prev) => ({ ...prev, emoji: e.target.value }))} />
        <Input className="flex-1" placeholder={t('newPlaceholder')} value={newCat.name} onChange={(e) => setNewCat((prev) => ({ ...prev, name: e.target.value }))} />
        <Button onClick={createCat} disabled={!newCat.name.trim()}>{t('createButton')}</Button>
      </div>

      {categories.some((c) => c.taskCount > 0) && (
        <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          {t('warning')}
        </div>
      )}

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  )
}
