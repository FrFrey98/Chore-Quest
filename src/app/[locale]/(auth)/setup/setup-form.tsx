'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Role = 'admin' | 'member' | 'child'

type MemberEntry = {
  id: string
  name: string
  pin: string
  pinConfirm: string
  role: Role
}

function emptyMember(): MemberEntry {
  return { id: crypto.randomUUID(), name: '', pin: '', pinConfirm: '', role: 'member' }
}

export function SetupForm() {
  const t = useTranslations('auth.setup')
  const tRoles = useTranslations('roles')
  const tCommon = useTranslations('common')

  function validateName(name: string): string | null {
    if (name.trim().length < 2) return t('validation.nameMin')
    if (name.trim().length > 50) return t('validation.nameMax')
    return null
  }

  function validatePin(pin: string, pinConfirm: string): string | null {
    if (!/^\d{4,8}$/.test(pin)) return t('validation.pinFormat')
    if (pin !== pinConfirm) return t('validation.pinMismatch')
    return null
  }

  const [step, setStep] = useState(1)
  const router = useRouter()

  // Step 2: admin
  const [adminName, setAdminName] = useState('')
  const [adminPin, setAdminPin] = useState('')
  const [adminPinConfirm, setAdminPinConfirm] = useState('')

  // Step 3: members
  const [members, setMembers] = useState<MemberEntry[]>([emptyMember()])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // --- Step 2 handlers ---
  function handleAdminNext() {
    setError('')
    const nameErr = validateName(adminName)
    if (nameErr) { setError(nameErr); return }
    const pinErr = validatePin(adminPin, adminPinConfirm)
    if (pinErr) { setError(pinErr); return }
    setStep(3)
  }

  // --- Step 3 handlers ---
  function updateMember(index: number, patch: Partial<MemberEntry>) {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  function addMember() {
    setMembers((prev) => [...prev, emptyMember()])
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index))
  }

  function handleMembersNext() {
    setError('')

    const allNames = [adminName.trim().toLowerCase()]

    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      const nameErr = validateName(m.name)
      if (nameErr) { setError(t('validation.memberError', { n: i + 1, error: nameErr })); return }

      const lowerName = m.name.trim().toLowerCase()
      if (allNames.includes(lowerName)) {
        setError(t('validation.memberNameUnique', { n: i + 1 }))
        return
      }
      allNames.push(lowerName)

      const pinErr = validatePin(m.pin, m.pinConfirm)
      if (pinErr) { setError(t('validation.memberError', { n: i + 1, error: pinErr })); return }
    }

    setStep(4)
  }

  // --- Step 4: submit ---
  async function handleSubmit() {
    setError('')
    setLoading(true)

    const users = [
      { name: adminName.trim(), pin: adminPin, role: 'admin' as Role },
      ...members.map((m) => ({ name: m.name.trim(), pin: m.pin, role: m.role })),
    ]

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('validation.genericError'))
        setLoading(false)
        return
      }
      router.push('/login')
    } catch {
      setError(t('validation.genericError'))
      setLoading(false)
    }
  }

  // --- Step 1: Welcome ---
  if (step === 1) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-medium">{t('welcome')}</p>
        <p className="text-slate-500 text-sm">{t('welcomeSubtitle')}</p>
        <Button className="w-full" onClick={() => setStep(2)}>
          {t('letsGo')}
        </Button>
      </div>
    )
  }

  // --- Step 2: Admin ---
  if (step === 2) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">{t('setupAdmin')}</h2>
        <Input
          placeholder={t('namePlaceholder')}
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          maxLength={50}
          autoFocus
        />
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder={t('pinPlaceholder')}
          value={adminPin}
          onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
        />
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder={t('pinConfirmPlaceholder')}
          value={adminPinConfirm}
          onChange={(e) => setAdminPinConfirm(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
          {t('back')}
        </Button>
        <Button className="w-full" onClick={handleAdminNext}>
          {t('next')}
        </Button>
      </div>
    )
  }

  // --- Step 3: Members ---
  if (step === 3) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">{t('familyMembers')}</h2>
        {members.map((m, i) => (
          <div key={m.id} className="space-y-2 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('memberN', { n: i + 1 })}</span>
              {members.length > 1 && (
                <button
                  type="button"
                  className="text-red-500 text-sm hover:underline"
                  onClick={() => removeMember(i)}
                >
                  {tCommon('remove')}
                </button>
              )}
            </div>
            <Input
              placeholder={t('namePlaceholder')}
              value={m.name}
              onChange={(e) => updateMember(i, { name: e.target.value })}
              maxLength={50}
            />
            <Input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              placeholder={t('pinPlaceholder')}
              value={m.pin}
              onChange={(e) => updateMember(i, { pin: e.target.value.replace(/\D/g, '') })}
              maxLength={8}
            />
            <Input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              placeholder={t('pinConfirmPlaceholder')}
              value={m.pinConfirm}
              onChange={(e) => updateMember(i, { pinConfirm: e.target.value.replace(/\D/g, '') })}
              maxLength={8}
            />
            <select
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
              value={m.role}
              onChange={(e) => updateMember(i, { role: e.target.value as Role })}
            >
              <option value="admin">{tRoles('admin')}</option>
              <option value="member">{tRoles('member')}</option>
              <option value="child">{tRoles('child')}</option>
            </select>
          </div>
        ))}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button variant="outline" className="w-full" onClick={addMember}>
          {t('addMember')}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
          {t('back')}
        </Button>
        <Button className="w-full" onClick={handleMembersNext}>
          {t('next')}
        </Button>
      </div>
    )
  }

  // --- Step 4: Summary ---
  const allUsers = [
    { name: adminName.trim(), role: 'admin' as Role },
    ...members.map((m) => ({ name: m.name.trim(), role: m.role })),
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">{t('summary')}</h2>
      <div className="space-y-2 bg-slate-50 rounded-xl p-4">
        {allUsers.map((u, i) => (
          <p key={i} className="text-sm">
            <span className="text-slate-500">{tRoles(u.role)}:</span>{' '}
            <span className="font-medium">{u.name}</span>
          </p>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button variant="outline" className="w-full" onClick={() => setStep(3)}>
        {t('back')}
      </Button>
      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? t('settingUp') : t('finishSetup')}
      </Button>
    </div>
  )
}
