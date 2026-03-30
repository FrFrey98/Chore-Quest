'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type User = { id: string; name: string }

export function LoginForm({ users }: { users: User[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      userId: selectedId,
      pin,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Falscher PIN. Nochmal versuchen.')
    } else {
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {users.map((u) => (
          <button
            key={u.id}
            type="button"
            disabled={loading}
            onClick={() => { setSelectedId(u.id); setError(''); setPin('') }}
            className={`p-4 rounded-xl border-2 text-center font-medium transition-colors ${
              selectedId === u.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {u.name}
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="space-y-2">
          <Input
            type="password"
            inputMode="numeric"
            pattern="\d*"
            placeholder="PIN eingeben"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={8}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !pin}>
            {loading ? 'Prüfe…' : 'Einloggen'}
          </Button>
        </div>
      )}
    </form>
  )
}
