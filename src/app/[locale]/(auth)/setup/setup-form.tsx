'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import templates from '@/data/task-templates.json'

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
  const locale = useLocale()
  const router = useRouter()

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

  // Step 1: Language
  const [selectedLocale, setSelectedLocale] = useState(locale)

  // Step 3: Admin
  const [adminName, setAdminName] = useState('')
  const [adminPin, setAdminPin] = useState('')
  const [adminPinConfirm, setAdminPinConfirm] = useState('')

  // Step 4: Members
  const [members, setMembers] = useState<MemberEntry[]>([emptyMember()])

  // Step 5: Categories
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())

  // Step 6: Tasks
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isSubmitting = useRef(false)

  // --- Helpers ---
  const isDE = selectedLocale === 'de'

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
    // Remove tasks from deselected category (idempotent if adding)
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      for (const key of prev) {
        if (key.startsWith(cat + '::')) next.delete(key)
      }
      return next
    })
  }

  function toggleTask(key: string) {
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function selectAllInCategory(category: string) {
    const cat = templates.find((c) => c.category === category)
    if (!cat) return
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      for (const tmpl of cat.templates) {
        next.add(`${category}::${tmpl.title}`)
      }
      return next
    })
  }

  function deselectAllInCategory(category: string) {
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      for (const key of prev) {
        if (key.startsWith(category + '::')) next.delete(key)
      }
      return next
    })
  }

  // --- Step 3 handlers ---
  function handleAdminNext() {
    setError('')
    const nameErr = validateName(adminName)
    if (nameErr) { setError(nameErr); return }
    const pinErr = validatePin(adminPin, adminPinConfirm)
    if (pinErr) { setError(pinErr); return }
    setStep(4)
  }

  // --- Step 4 handlers ---
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

    setStep(5)
  }

  // --- Step 5 handler ---
  function handleCategoriesNext() {
    setError('')
    // Pre-select all tasks in chosen categories
    const newTasks = new Set<string>()
    for (const catName of selectedCategories) {
      const cat = templates.find((c) => c.category === catName)
      if (cat) {
        for (const tmpl of cat.templates) {
          newTasks.add(`${catName}::${tmpl.title}`)
        }
      }
    }
    setSelectedTasks(newTasks)
    setStep(6)
  }

  // --- Step 7: submit ---
  async function handleSubmit() {
    if (isSubmitting.current) return
    isSubmitting.current = true
    setError('')
    setLoading(true)

    const users = [
      { name: adminName.trim(), pin: adminPin, role: 'admin' as Role },
      ...members.map((m) => ({ name: m.name.trim(), pin: m.pin, role: m.role })),
    ]

    const categories = templates
      .filter((c) => selectedCategories.has(c.category))
      .map((c) => ({ name: isDE ? c.categoryDe : c.category, emoji: c.emoji }))

    const tasks = templates
      .filter((c) => selectedCategories.has(c.category))
      .flatMap((c) =>
        c.templates
          .filter((tmpl) => selectedTasks.has(`${c.category}::${tmpl.title}`))
          .map((tmpl) => ({
            title: isDE ? tmpl.titleDe : tmpl.title,
            emoji: tmpl.emoji,
            points: tmpl.suggestedPoints,
            categoryName: isDE ? c.categoryDe : c.category,
            isRecurring: true,
            recurringInterval: tmpl.suggestedInterval,
          }))
      )

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users, locale: selectedLocale, categories, tasks }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('validation.genericError'))
        return
      }
      router.push('/login')
    } catch {
      setError(t('validation.genericError'))
    } finally {
      isSubmitting.current = false
      setLoading(false)
    }
  }

  // --- Step 1: Language Selection ---
  if (step === 1) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-medium">{t('chooseLanguage')}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-colors ${
              selectedLocale === 'en'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => {
              setSelectedLocale('en')
              document.cookie = `NEXT_LOCALE=en;path=/;max-age=31536000`
              router.refresh()
              setStep(2)
            }}
          >
            <span className="text-4xl">🇬🇧</span>
            <span className="font-medium">English</span>
          </button>
          <button
            type="button"
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-colors ${
              selectedLocale === 'de'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => {
              setSelectedLocale('de')
              document.cookie = `NEXT_LOCALE=de;path=/;max-age=31536000`
              router.refresh()
              setStep(2)
            }}
          >
            <span className="text-4xl">🇩🇪</span>
            <span className="font-medium">Deutsch</span>
          </button>
        </div>
      </div>
    )
  }

  // --- Step 2: Welcome ---
  if (step === 2) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-medium">{t('welcome')}</p>
        <p className="text-muted-foreground text-sm">{t('welcomeSubtitle')}</p>
        <Button className="w-full" onClick={() => setStep(3)}>
          {t('letsGo')}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
          {t('back')}
        </Button>
      </div>
    )
  }

  // --- Step 3: Admin ---
  if (step === 3) {
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
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
          {t('back')}
        </Button>
        <Button className="w-full" onClick={handleAdminNext}>
          {t('next')}
        </Button>
      </div>
    )
  }

  // --- Step 4: Members ---
  if (step === 4) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">{t('familyMembers')}</h2>
        {members.map((m, i) => (
          <div key={m.id} className="space-y-2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('memberN', { n: i + 1 })}</span>
              {members.length > 1 && (
                <button
                  type="button"
                  className="text-danger text-sm hover:underline"
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
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-card"
              value={m.role}
              onChange={(e) => updateMember(i, { role: e.target.value as Role })}
            >
              <option value="admin">{tRoles('admin')}</option>
              <option value="member">{tRoles('member')}</option>
              <option value="child">{tRoles('child')}</option>
            </select>
          </div>
        ))}
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button variant="outline" className="w-full" onClick={addMember}>
          {t('addMember')}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setStep(3)}>
          {t('back')}
        </Button>
        <Button className="w-full" onClick={handleMembersNext}>
          {t('next')}
        </Button>
      </div>
    )
  }

  // --- Step 5: Category Selection ---
  if (step === 5) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">{t('chooseCategories')}</h2>
        <p className="text-muted-foreground text-sm text-center">{t('chooseCategoriesSubtitle')}</p>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((cat) => {
            const selected = selectedCategories.has(cat.category)
            return (
              <button
                key={cat.category}
                type="button"
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleCategory(cat.category)}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="font-medium text-sm">
                  {isDE ? cat.categoryDe : cat.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.templates.length} {isDE ? 'Aufgaben' : 'tasks'}
                </span>
              </button>
            )
          })}
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button variant="outline" className="w-full" onClick={() => setStep(4)}>
          {t('back')}
        </Button>
        <Button
          className="w-full"
          onClick={handleCategoriesNext}
          disabled={selectedCategories.size === 0}
        >
          {t('next')}
        </Button>
      </div>
    )
  }

  // --- Step 6: Task Import ---
  if (step === 6) {
    const filteredTemplates = templates.filter((c) => selectedCategories.has(c.category))
    const totalSelected = selectedTasks.size

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">{t('importTasks')}</h2>
        <p className="text-muted-foreground text-sm text-center">{t('importTasksSubtitle')}</p>
        <p className="text-sm font-medium text-center">
          {t('tasksSelected', { count: totalSelected })}
        </p>

        {filteredTemplates.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">{t('noTemplatesForCategories')}</p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {filteredTemplates.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {cat.emoji} {isDE ? cat.categoryDe : cat.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => selectAllInCategory(cat.category)}
                    >
                      {t('selectAll')}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:underline"
                      onClick={() => deselectAllInCategory(cat.category)}
                    >
                      {t('deselectAll')}
                    </button>
                  </div>
                </div>
                {cat.templates.map((tmpl) => {
                  const key = `${cat.category}::${tmpl.title}`
                  const checked = selectedTasks.has(key)
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                        checked ? 'border-primary/50 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTask(key)}
                        className="rounded"
                      />
                      <span className="text-base">{tmpl.emoji}</span>
                      <span className="text-sm flex-1">
                        {isDE ? tmpl.titleDe : tmpl.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tmpl.suggestedPoints} pts
                      </span>
                    </label>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => setStep(5)}>
          {t('back')}
        </Button>
        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:underline text-center py-1"
          onClick={() => {
            setSelectedTasks(new Set())
            setStep(7)
          }}
        >
          {t('skipTasks')}
        </button>
        <Button className="w-full" onClick={() => setStep(7)}>
          {t('next')}
        </Button>
      </div>
    )
  }

  // --- Step 7: Summary ---
  const allUsers = [
    { name: adminName.trim(), role: 'admin' as Role },
    ...members.map((m) => ({ name: m.name.trim(), role: m.role })),
  ]

  const selectedCategoryList = templates.filter((c) => selectedCategories.has(c.category))
  const totalTaskCount = selectedTasks.size

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">{t('summary')}</h2>
      <div className="space-y-3 bg-muted/50 rounded-xl p-4">
        {/* Language */}
        <div className="text-sm">
          <span className="text-muted-foreground">{t('chooseLanguage')}:</span>{' '}
          <span className="font-medium">
            {selectedLocale === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
          </span>
        </div>

        {/* Users */}
        <div className="space-y-1">
          {allUsers.map((u, i) => (
            <p key={i} className="text-sm">
              <span className="text-muted-foreground">{tRoles(u.role)}:</span>{' '}
              <span className="font-medium">{u.name}</span>
            </p>
          ))}
        </div>

        {/* Categories */}
        <div className="text-sm">
          <span className="text-muted-foreground">
            {t('chooseCategories')} ({selectedCategoryList.length}):
          </span>{' '}
          <span className="font-medium">
            {selectedCategoryList.map((c) => `${c.emoji} ${isDE ? c.categoryDe : c.category}`).join(', ')}
          </span>
        </div>

        {/* Tasks */}
        <div className="text-sm">
          <span className="text-muted-foreground">{t('importTasks')}:</span>{' '}
          <span className="font-medium">{totalTaskCount}</span>
        </div>
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button variant="outline" className="w-full" onClick={() => setStep(6)}>
        {t('back')}
      </Button>
      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? t('settingUp') : t('finishSetup')}
      </Button>
    </div>
  )
}
