'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type User = { id: string; name: string; role: string }

export function LoginForm({ users }: { users: User[] }) {
  const t = useTranslations('auth.login')
  const tRoles = useTranslations('roles')

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
      setError(t('wrongPin'))
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
            className={`p-4 rounded-xl border-2 text-center transition-colors ${
              selectedId === u.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border hover:border-border'
            }`}
          >
            <span className="font-medium block">{u.name}</span>
            <span className="text-xs text-muted-foreground">{tRoles(u.role as 'admin' | 'member' | 'child') ?? u.role}</span>
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="space-y-2">
          <Input
            type="password"
            inputMode="numeric"
            pattern="\d*"
            placeholder={t('pinPlaceholder')}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={8}
            autoFocus
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !pin}>
            {loading ? t('checking') : t('submit')}
          </Button>
        </div>
      )}
    </form>
  )
}
