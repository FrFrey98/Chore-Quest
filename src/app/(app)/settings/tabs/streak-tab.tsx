'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig, type StreakTierDef } from '@/lib/config'

export function StreakTab({ config }: { config: GameConfig }) {
  const router = useRouter()
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
      setMsg('Gespeichert \u2713')
      router.refresh()
    } else {
      setMsg('Fehler beim Speichern')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-1">Streak-Tiers</h2>
        <p className="text-sm text-slate-500 mb-3">Bonus-Stufen basierend auf aufeinanderfolgenden Tagen. Werden automatisch nach Tagen absteigend sortiert.</p>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center flex-wrap">
              <label className="text-xs text-slate-500 w-12">Ab Tag</label>
              <Input
                type="number"
                className="w-16 text-center"
                value={tier.minDays}
                onChange={(e) => updateTier(i, 'minDays', Number(e.target.value))}
              />
              <label className="text-xs text-slate-500 w-12">Bonus</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  className="w-16 text-center"
                  value={tier.percent}
                  onChange={(e) => updateTier(i, 'percent', Number(e.target.value))}
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
              <label className="text-xs text-slate-500 w-10">Name</label>
              <Input
                className="flex-1 min-w-[100px]"
                value={tier.name}
                onChange={(e) => updateTier(i, 'name', e.target.value)}
              />
              <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-lg px-1">\u00d7</button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addTier}>+ Tier hinzuf\u00fcgen</Button>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">Streak-Restore Preisformel</h2>
        <p className="text-sm text-slate-500 mb-3">Preis = Basis + (Pro-Tag \u00d7 aktuelle Streak-Tage)</p>
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-slate-500">Basis-Preis</label>
            <Input type="number" className="w-24" value={restoreBase} onChange={(e) => setRestoreBase(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Pro Streak-Tag</label>
            <Input type="number" className="w-24" value={restorePerDay} onChange={(e) => setRestorePerDay(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {msg && <p className="text-sm text-slate-500">{msg}</p>}
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}
