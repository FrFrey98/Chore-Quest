'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UsersTab({ users }: { users: { id: string; name: string }[] }) {
  const router = useRouter()
  const [names, setNames] = useState<Record<string, string>>(
    Object.fromEntries(users.map((u) => [u.id, u.name]))
  )
  const [pins, setPins] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<Record<string, string>>({})

  async function saveName(uid: string) {
    setMsg((prev) => ({ ...prev, [uid]: '' }))
    const name = names[uid]?.trim()
    if (!name) return
    const res = await fetch(`/api/settings/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      setMsg((prev) => ({ ...prev, [uid]: 'Name gespeichert \u2713' }))
      router.refresh()
    } else {
      const data = await res.json()
      setMsg((prev) => ({ ...prev, [uid]: data.error ?? 'Fehler' }))
    }
  }

  async function changePin(uid: string) {
    setMsg((prev) => ({ ...prev, [`pin-${uid}`]: '' }))
    const pin = pins[uid]
    if (!pin || pin.length < 4) {
      setMsg((prev) => ({ ...prev, [`pin-${uid}`]: 'Mindestens 4 Zeichen' }))
      return
    }
    const res = await fetch(`/api/users/${uid}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      setPins((prev) => ({ ...prev, [uid]: '' }))
      setMsg((prev) => ({ ...prev, [`pin-${uid}`]: 'PIN ge\u00e4ndert \u2713' }))
    } else {
      setMsg((prev) => ({ ...prev, [`pin-${uid}`]: 'Fehler' }))
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Namen und PINs f\u00fcr beide Benutzer verwalten.</p>
      {users.map((u) => (
        <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{u.name}</span>
            <span className="text-xs text-slate-400">{u.id}</span>
          </div>
          <div>
            <label className="text-xs text-slate-500">Name</label>
            <div className="flex gap-2">
              <Input
                value={names[u.id] ?? ''}
                onChange={(e) => setNames((prev) => ({ ...prev, [u.id]: e.target.value }))}
              />
              <Button onClick={() => saveName(u.id)} disabled={names[u.id]?.trim() === u.name}>
                Speichern
              </Button>
            </div>
            {msg[u.id] && <p className="text-xs text-slate-500 mt-1">{msg[u.id]}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500">Neue PIN</label>
            <div className="flex gap-2">
              <Input
                type="password"
                inputMode="numeric"
                placeholder="Min. 4 Zeichen"
                value={pins[u.id] ?? ''}
                onChange={(e) => setPins((prev) => ({ ...prev, [u.id]: e.target.value }))}
              />
              <Button onClick={() => changePin(u.id)} disabled={!pins[u.id]}>
                \u00c4ndern
              </Button>
            </div>
            {msg[`pin-${u.id}`] && <p className="text-xs text-slate-500 mt-1">{msg[`pin-${u.id}`]}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
