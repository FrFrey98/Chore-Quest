'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Category = { id: string; name: string; emoji: string }
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: Category }

const activeTab = 'flex-1 py-2 text-sm font-medium rounded-md transition-colors bg-white text-slate-900 shadow-sm'
const inactiveTab = 'flex-1 py-2 text-sm font-medium rounded-md transition-colors text-slate-500'

export function AdminClient({ categories, storeItems, tasks, userId }: {
  categories: Category[]; storeItems: StoreItem[]; tasks: Task[]; userId: string
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'tasks' | 'store' | 'settings'>('tasks')

  // --- New Task form ---
  const [taskForm, setTaskForm] = useState({
    title: '', emoji: '🏠', points: 30, categoryId: categories[0]?.id ?? '',
    isRecurring: false, recurringInterval: 'weekly',
  })

  async function createTask() {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskForm),
    })
    if (res.ok) {
      setTaskForm(prev => ({ ...prev, title: '' }))
      router.refresh()
    }
  }

  // --- New Store Item form ---
  const [itemForm, setItemForm] = useState({
    title: '', emoji: '🏆', description: '', pointCost: 500, type: 'trophy',
  })

  async function createStoreItem() {
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...itemForm, isActive: true }),
    })
    if (res.ok) {
      setItemForm(prev => ({ ...prev, title: '', description: '' }))
      router.refresh()
    }
  }

  // --- Archive task ---
  async function archiveTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  // --- PIN change ---
  const [users, setUsers] = useState<{ id: string; name: string | null }[]>([])
  const [newPin, setNewPin] = useState<Record<string, string>>({})
  const [pinMsg, setPinMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers)
  }, [])

  async function changePin(uid: string) {
    const pin = newPin[uid]
    if (!pin || pin.length < 4) {
      setPinMsg(prev => ({ ...prev, [uid]: 'Mindestens 4 Zeichen' }))
      return
    }
    const res = await fetch(`/api/users/${uid}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      setNewPin(prev => ({ ...prev, [uid]: '' }))
      setPinMsg(prev => ({ ...prev, [uid]: 'PIN geändert ✓' }))
    } else {
      setPinMsg(prev => ({ ...prev, [uid]: 'Fehler' }))
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Admin</h1>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6">
        <button onClick={() => setTab('tasks')} className={tab === 'tasks' ? activeTab : inactiveTab}>Aufgaben</button>
        <button onClick={() => setTab('store')} className={tab === 'store' ? activeTab : inactiveTab}>Store</button>
        <button onClick={() => setTab('settings')} className={tab === 'settings' ? activeTab : inactiveTab}>Einstellungen</button>
      </div>

      {tab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold">Neue Aufgabe anlegen</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Emoji</Label>
                <Input value={taskForm.emoji} onChange={(e) => setTaskForm({ ...taskForm, emoji: e.target.value })} />
              </div>
              <div>
                <Label>Punkte</Label>
                <Input type="number" value={taskForm.points} onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Titel</Label>
              <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Kategorie</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={taskForm.categoryId}
                onChange={(e) => setTaskForm({ ...taskForm, categoryId: e.target.value })}
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recurring" checked={taskForm.isRecurring}
                onChange={(e) => setTaskForm({ ...taskForm, isRecurring: e.target.checked })} />
              <Label htmlFor="recurring">Wiederkehrend</Label>
              {taskForm.isRecurring && (
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={taskForm.recurringInterval}
                  onChange={(e) => setTaskForm({ ...taskForm, recurringInterval: e.target.value })}
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="monthly">Monatlich</option>
                </select>
              )}
            </div>
            <Button onClick={createTask} disabled={!taskForm.title || !taskForm.categoryId}>
              Aufgabe anlegen (→ Freigabe nötig)
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Aufgaben</h2>
            {tasks.length === 0 && <p className="text-slate-400 text-sm">Keine Aufgaben.</p>}
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <span>{t.emoji}</span>
                <span className="flex-1 text-sm">{t.title}</span>
                <span className="text-xs text-slate-400">{t.status}</span>
                <Button variant="outline" size="sm" onClick={() => archiveTask(t.id)}>Archivieren</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold">Neuen Store-Artikel anlegen</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Emoji</Label>
                <Input value={itemForm.emoji} onChange={(e) => setItemForm({ ...itemForm, emoji: e.target.value })} />
              </div>
              <div>
                <Label>Preis (Pkt)</Label>
                <Input type="number" value={itemForm.pointCost} onChange={(e) => setItemForm({ ...itemForm, pointCost: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Titel</Label>
              <Input value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Typ</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={itemForm.type}
                onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
              >
                <option value="trophy">🏆 Trophäe</option>
                <option value="real_reward">🎁 Belohnung</option>
              </select>
            </div>
            <Button onClick={createStoreItem} disabled={!itemForm.title || !itemForm.description}>
              Artikel anlegen
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Store-Artikel</h2>
            {storeItems.length === 0 && <p className="text-slate-400 text-sm">Keine Artikel.</p>}
            {storeItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <span>{item.emoji}</span>
                <span className="flex-1 text-sm">{item.title}</span>
                <span className="text-xs text-slate-400">{item.pointCost} Pkt</span>
                <span className="text-xs text-slate-400">{item.isActive ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          <h2 className="font-semibold">PIN ändern</h2>
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
              <p className="font-medium">{u.name ?? 'Unbekannt'}</p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="Neuer PIN (min. 4 Zeichen)"
                  value={newPin[u.id] ?? ''}
                  onChange={(e) => setNewPin(prev => ({ ...prev, [u.id]: e.target.value }))}
                />
                <Button onClick={() => changePin(u.id)} disabled={!newPin[u.id]}>
                  Ändern
                </Button>
              </div>
              {pinMsg[u.id] && <p className="text-xs text-slate-500">{pinMsg[u.id]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
