'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SetupForm() {
  const [step, setStep] = useState(1)
  const [user1Name, setUser1Name] = useState('')
  const [user1Pin, setUser1Pin] = useState('')
  const [user1PinConfirm, setUser1PinConfirm] = useState('')
  const [user2Name, setUser2Name] = useState('')
  const [user2Pin, setUser2Pin] = useState('')
  const [user2PinConfirm, setUser2PinConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function validateName(name: string): string | null {
    if (name.trim().length < 2) return 'Name muss mindestens 2 Zeichen lang sein.'
    if (name.trim().length > 50) return 'Name darf maximal 50 Zeichen lang sein.'
    return null
  }

  function validatePin(pin: string, pinConfirm: string): string | null {
    if (!/^\d{4,8}$/.test(pin)) return 'PIN muss 4-8 Ziffern lang sein.'
    if (pin !== pinConfirm) return 'PINs stimmen nicht überein.'
    return null
  }

  function handleStep2() {
    setError('')
    const nameErr = validateName(user1Name)
    if (nameErr) { setError(nameErr); return }
    const pinErr = validatePin(user1Pin, user1PinConfirm)
    if (pinErr) { setError(pinErr); return }
    setStep(3)
  }

  function handleStep3() {
    setError('')
    const nameErr = validateName(user2Name)
    if (nameErr) { setError(nameErr); return }
    if (user2Name.trim().toLowerCase() === user1Name.trim().toLowerCase()) {
      setError('Die Namen müssen unterschiedlich sein.')
      return
    }
    const pinErr = validatePin(user2Pin, user2PinConfirm)
    if (pinErr) { setError(pinErr); return }
    setStep(4)
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: { name: user1Name.trim(), pin: user1Pin },
          user2: { name: user2Name.trim(), pin: user2Pin },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten.')
        setLoading(false)
        return
      }
      router.push('/login')
    } catch {
      setError('Ein Fehler ist aufgetreten.')
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-medium">Willkommen bei TidyQuest!</p>
        <p className="text-slate-500 text-sm">Richte dein Duo ein, um zu starten.</p>
        <Button className="w-full" onClick={() => setStep(2)}>
          Los geht&apos;s
        </Button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Spieler 1</h2>
        <Input
          placeholder="Name"
          value={user1Name}
          onChange={(e) => setUser1Name(e.target.value)}
          maxLength={50}
          autoFocus
        />
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder="PIN (4-8 Ziffern)"
          value={user1Pin}
          onChange={(e) => setUser1Pin(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
        />
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder="PIN bestätigen"
          value={user1PinConfirm}
          onChange={(e) => setUser1PinConfirm(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="w-full" onClick={handleStep2}>
          Weiter
        </Button>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Spieler 2</h2>
        <Input
          placeholder="Name"
          value={user2Name}
          onChange={(e) => setUser2Name(e.target.value)}
          maxLength={50}
          autoFocus
        />
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder="PIN (4-8 Ziffern)"
          value={user2Pin}
          onChange={(e) => setUser2Pin(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
        />
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder="PIN bestätigen"
          value={user2PinConfirm}
          onChange={(e) => setUser2PinConfirm(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="w-full" onClick={handleStep3}>
          Weiter
        </Button>
      </div>
    )
  }

  // Step 4: Confirmation
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Zusammenfassung</h2>
      <div className="space-y-2 bg-slate-50 rounded-xl p-4">
        <p className="text-sm">
          <span className="text-slate-500">Spieler 1:</span>{' '}
          <span className="font-medium">{user1Name.trim()}</span>
        </p>
        <p className="text-sm">
          <span className="text-slate-500">Spieler 2:</span>{' '}
          <span className="font-medium">{user2Name.trim()}</span>
        </p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Wird eingerichtet...' : 'Einrichtung abschließen'}
      </Button>
    </div>
  )
}
