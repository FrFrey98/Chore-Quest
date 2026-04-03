'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Category = { id: string; name: string; emoji: string; taskCount: number }

export function CategoriesTab({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
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
      setMsg('Gespeichert ✓')
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? 'Fehler')
    }
  }

  async function deleteCat(id: string) {
    setMsg('')
    const res = await fetch(`/api/settings/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setMsg('Gelöscht ✓')
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? 'Fehler')
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
      setMsg('Erstellt ✓')
      router.refresh()
    } else {
      const data = await res.json()
      setMsg(data.error ?? 'Fehler')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Kategorien für die Aufgaben-Gruppierung.</p>
      <div className="space-y-2">
        {categories.map((cat) => {
          const edit = edits[cat.id]
          return (
            <div key={cat.id} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center">
              {edit ? (
                <>
                  <Input className="w-12 text-center text-lg" value={edit.emoji} onChange={(e) => setEdits((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], emoji: e.target.value } }))} />
                  <Input className="flex-1" value={edit.name} onChange={(e) => setEdits((prev) => ({ ...prev, [cat.id]: { ...prev[cat.id], name: e.target.value } }))} />
                  <Button size="sm" onClick={() => saveEdit(cat.id)}>✓</Button>
                  <button onClick={() => cancelEdit(cat.id)} className="text-slate-400 px-1">✕</button>
                </>
              ) : (
                <>
                  <span className="text-lg w-8 text-center">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.taskCount} Tasks</span>
                  <button onClick={() => startEdit(cat)} className="text-slate-400 hover:text-slate-600 text-sm">✏️</button>
                  <button onClick={() => deleteCat(cat.id)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-3 flex gap-2 items-center">
        <Input className="w-12 text-center text-lg" value={newCat.emoji} onChange={(e) => setNewCat((prev) => ({ ...prev, emoji: e.target.value }))} />
        <Input className="flex-1" placeholder="Neue Kategorie" value={newCat.name} onChange={(e) => setNewCat((prev) => ({ ...prev, name: e.target.value }))} />
        <Button onClick={createCat} disabled={!newCat.name.trim()}>Erstellen</Button>
      </div>

      {categories.some((c) => c.taskCount > 0) && (
        <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          ⚠️ Kategorien mit zugeordneten Tasks können nicht gelöscht werden. Erst alle Tasks umziehen oder archivieren.
        </div>
      )}

      {msg && <p className="text-sm text-slate-500">{msg}</p>}
    </div>
  )
}
