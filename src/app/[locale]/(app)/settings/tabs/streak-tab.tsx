'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig, type StreakTierDef } from '@/lib/config'

export function StreakTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const t = useTranslations('settings.streak')
  const tc = useTranslations('common')
  const [tiers, setTiers] = useState<StreakTierDef[]>([...config.streakTiers])
  const [restoreBase, setRestoreBase] = useState(config.restoreBasePrice)
  const [restorePerDay, setRestorePerDay] = useState(config.restorePerDayPrice)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateTier(index: number, field: keyof StreakTierDef, value: string | number) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  function removeTier(index: number) {
    if (tiers.length <= 1) return
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  function addTier() {
    setTiers((prev) => [...prev, { minDays: 0, percent: 0, name: '' }])
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const sorted = [...tiers].sort((a, b) => b.minDays - a.minDays)
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [
          { key: 'streak_tiers', value: sorted },
          { key: 'restore_base_price', value: restoreBase },
          { key: 'restore_per_day_price', value: restorePerDay },
        ],
      }),
    })
    setSaving(false)
    if (res.ok) {
      setTiers(sorted)
      setMsg(tc('saved'))
      router.refresh()
    } else {
      setMsg(tc('saveFailed'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-1">{t('heading')}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t('description')}</p>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-card rounded-lg p-3 shadow-sm flex gap-2 items-center flex-wrap">
              <label className="text-xs text-muted-foreground w-12">{t('fromDay')}</label>
              <Input
                type="number"
                className="w-16 text-center"
                value={tier.minDays}
                onChange={(e) => updateTier(i, 'minDays', Number(e.target.value))}
              />
              <label className="text-xs text-muted-foreground w-12">{t('bonus')}</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  className="w-16 text-center"
                  value={tier.percent}
                  onChange={(e) => updateTier(i, 'percent', Number(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <label className="text-xs text-muted-foreground w-10">{t('name')}</label>
              <Input
                className="flex-1 min-w-[100px]"
                value={tier.name}
                onChange={(e) => updateTier(i, 'name', e.target.value)}
              />
              <button onClick={() => removeTier(i)} className="text-danger hover:text-danger text-lg px-1">×</button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addTier}>{t('addTier')}</Button>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">{t('restoreHeading')}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t('restoreDescription')}</p>
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-muted-foreground">{t('basePrice')}</label>
            <Input type="number" className="w-24" value={restoreBase} onChange={(e) => setRestoreBase(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t('perDay')}</label>
            <Input type="number" className="w-24" value={restorePerDay} onChange={(e) => setRestorePerDay(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? tc('saving') : tc('save')}
        </Button>
      </div>
    </div>
  )
}
