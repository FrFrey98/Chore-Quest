'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type UserItem = { id: string; name: string; role: string; createdAt: string }

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Mitglied',
  child: 'Kind',
}

const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-700',
  member: 'bg-slate-100 text-slate-600',
  child: 'bg-emerald-100 text-emerald-700',
}

export function UsersTab({
  users,
  currentUserId,
}: {
  users: UserItem[]
  currentUserId: string
}) {
  const router = useRouter()

  // Add member form state
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newRole, setNewRole] = useState('member')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Per-user edit state
  const [editNames, setEditNames] = useState<Record<string, string>>(
    Object.fromEntries(users.map((u) => [u.id, u.name]))
  )
  const [editRoles, setEditRoles] = useState<Record<string, string>>(
    Object.fromEntries(users.map((u) => [u.id, u.role]))
  )

  // Sync editRoles when users prop changes
  useEffect(() => {
    setEditRoles(Object.fromEntries(users.map((u) => [u.id, u.role])))
  }, [users])

  const [pins, setPins] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function setUserLoading(uid: string, val: boolean) {
    setLoading((prev) => ({ ...prev, [uid]: val }))
  }
  function setUserMsg(key: string, val: string) {
    setMsg((prev) => ({ ...prev, [key]: val }))
  }

  async function handleAdd() {
    setAddError('')
    const name = newName.trim()
    if (name.length < 2) { setAddError('Name muss mind. 2 Zeichen haben'); return }
    if (!/^\d{4,8}$/.test(newPin)) { setAddError('PIN muss 4–8 Ziffern haben'); return }
    setAddLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin: newPin, role: newRole }),
    })
    setAddLoading(false)
    if (res.ok) {
      setShowAdd(false)
      setNewName('')
      setNewPin('')
      setNewRole('member')
      router.refresh()
    } else {
      const data = await res.json()
      setAddError(data.error ?? 'Fehler beim Hinzufügen')
    }
  }

  async function saveName(uid: string, originalName: string) {
    setUserMsg(uid, '')
    const name = editNames[uid]?.trim()
    if (!name || name === originalName) return
    setUserLoading(uid, true)
    const res = await fetch(`/api/settings/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setUserLoading(uid, false)
    if (res.ok) {
      setUserMsg(uid, 'Name gespeichert')
      router.refresh()
    } else {
      const data = await res.json()
      setUserMsg(uid, data.error ?? 'Fehler')
    }
  }

  async function saveRole(uid: string, role: string) {
    setUserMsg(`role-${uid}`, '')
    setUserLoading(`role-${uid}`, true)
    const res = await fetch(`/api/users/${uid}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setUserLoading(`role-${uid}`, false)
    if (res.ok) {
      setUserMsg(`role-${uid}`, 'Rolle gespeichert')
      router.refresh()
    } else {
      const data = await res.json()
      setUserMsg(`role-${uid}`, data.error ?? 'Fehler')
    }
  }

  async function changePin(uid: string) {
    setUserMsg(`pin-${uid}`, '')
    const pin = pins[uid]
    if (!pin || !/^\d{4,8}$/.test(pin)) {
      setUserMsg(`pin-${uid}`, 'PIN muss 4–8 Ziffern haben')
      return
    }
    setUserLoading(`pin-${uid}`, true)
    const res = await fetch(`/api/users/${uid}/pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    setUserLoading(`pin-${uid}`, false)
    if (res.ok) {
      setPins((prev) => ({ ...prev, [uid]: '' }))
      setUserMsg(`pin-${uid}`, 'PIN geändert')
      router.refresh()
    } else {
      const data = await res.json()
      setUserMsg(`pin-${uid}`, data.error ?? 'Fehler')
    }
  }

  async function deleteMember(uid: string) {
    setUserMsg(`del-${uid}`, '')
    setUserLoading(`del-${uid}`, true)
    const res = await fetch(`/api/users/${uid}`, { method: 'DELETE' })
    setUserLoading(`del-${uid}`, false)
    setConfirmDelete(null)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setUserMsg(`del-${uid}`, data.error ?? 'Fehler beim Löschen')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Familienmitglieder verwalten</p>
        <Button size="sm" onClick={() => { setShowAdd((v) => !v); setAddError('') }}>
          {showAdd ? 'Abbrechen' : '+ Mitglied'}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-indigo-100">
          <p className="font-semibold text-sm">Neues Mitglied</p>
          <div>
            <label className="text-xs text-slate-500">Name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">PIN (4–8 Ziffern)</label>
            <Input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              maxLength={8}
              placeholder="PIN"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Rolle</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="member">Mitglied</option>
              <option value="child">Kind</option>
            </select>
          </div>
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <Button onClick={handleAdd} disabled={addLoading} className="w-full">
            {addLoading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
          </Button>
        </div>
      )}

      {users.map((u) => {
        const isOwn = u.id === currentUserId
        return (
          <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">{u.name}</span>
              {isOwn && <span className="text-xs text-slate-400">(du)</span>}
              <span
                className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE_CLASS[u.role] ?? 'bg-slate-100 text-slate-600'}`}
              >
                {ROLE_LABELS[u.role] ?? u.role}
              </span>
            </div>

            {/* Edit name */}
            <div>
              <label className="text-xs text-slate-500">Name</label>
              <div className="flex gap-2">
                <Input
                  value={editNames[u.id] ?? ''}
                  onChange={(e) => setEditNames((prev) => ({ ...prev, [u.id]: e.target.value }))}
                />
                <Button
                  onClick={() => saveName(u.id, u.name)}
                  disabled={loading[u.id] || (editNames[u.id]?.trim() === u.name)}
                >
                  Speichern
                </Button>
              </div>
              {msg[u.id] && <p className="text-xs text-slate-500 mt-1">{msg[u.id]}</p>}
            </div>

            {/* Change role — hidden for own account */}
            {!isOwn && (
              <div>
                <label className="text-xs text-slate-500">Rolle</label>
                <div className="flex gap-2">
                  <select
                    value={editRoles[u.id] ?? u.role}
                    onChange={(e) => setEditRoles((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Mitglied</option>
                    <option value="child">Kind</option>
                  </select>
                  <Button
                    onClick={() => saveRole(u.id, editRoles[u.id] ?? u.role)}
                    disabled={loading[`role-${u.id}`] || (editRoles[u.id] ?? u.role) === u.role}
                  >
                    Speichern
                  </Button>
                </div>
                {msg[`role-${u.id}`] && <p className="text-xs text-slate-500 mt-1">{msg[`role-${u.id}`]}</p>}
              </div>
            )}

            {/* Change PIN */}
            <div>
              <label className="text-xs text-slate-500">Neue PIN</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="4–8 Ziffern"
                  value={pins[u.id] ?? ''}
                  onChange={(e) => setPins((prev) => ({ ...prev, [u.id]: e.target.value.replace(/\D/g, '') }))}
                  maxLength={8}
                />
                <Button
                  onClick={() => changePin(u.id)}
                  disabled={loading[`pin-${u.id}`] || !pins[u.id]}
                >
                  Ändern
                </Button>
              </div>
              {msg[`pin-${u.id}`] && <p className="text-xs text-slate-500 mt-1">{msg[`pin-${u.id}`]}</p>}
            </div>

            {/* Delete — hidden for own account */}
            {!isOwn && (
              <div>
                {confirmDelete === u.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Wirklich löschen?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMember(u.id)}
                      disabled={loading[`del-${u.id}`]}
                    >
                      Ja, löschen
                    </Button>
                    <button
                      className="text-xs text-slate-400 underline"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-xs text-red-500 underline"
                    onClick={() => setConfirmDelete(u.id)}
                  >
                    Mitglied entfernen
                  </button>
                )}
                {msg[`del-${u.id}`] && <p className="text-xs text-red-500 mt-1">{msg[`del-${u.id}`]}</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
