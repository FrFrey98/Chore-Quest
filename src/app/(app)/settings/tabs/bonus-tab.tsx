'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig } from '@/lib/config'

type IntervalEntry = { name: string; days: number }

export function BonusTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const [teamworkPercent, setTeamworkPercent] = useState(config.teamworkBonusPercent)
  const [intervals, setIntervals] = useState<IntervalEntry[]>(
    Object.entries(config.recurringIntervals).map(([name, days]) => ({ name, days }))
  )
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateInterval(index: number, field: 'name' | 'days', value: string | number) {
    setIntervals((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function removeInterval(index: number) {
    setIntervals((prev) => prev.filter((_, i) => i !== index))
  }

  function addInterval() {
    setIntervals((prev) => [...prev, { name: '', days: 1 }])
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const intervalsObj: Record<string, number> = {}
    for (const item of intervals) {
      if (item.name.trim()) intervalsObj[item.name.trim()] = item.days
    }
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [
          { key: 'teamwork_bonus_percent', value: teamworkPercent },
          { key: 'recurring_intervals', value: intervalsObj },
        ],
      }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg('Gespeichert \u2713')
      router.refresh()
    } else {
      setMsg('Fehler beim Speichern')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-1">Teamwork-Bonus</h2>
        <p className="text-sm text-slate-500 mb-3">Zus\u00e4tzlicher Bonus wenn eine Aufgabe zusammen erledigt wird.</p>
        <div className="flex items-center gap-2">
          <Input type="number" className="w-20 text-center" value={teamworkPercent} onChange={(e) => setTeamworkPercent(Number(e.target.value))} />
          <span className="text-sm text-slate-500">%</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">Wiederkehr-Intervalle</h2>
        <p className="text-sm text-slate-500 mb-3">Definiert die verf\u00fcgbaren Intervalle f\u00fcr wiederkehrende Aufgaben.</p>
        <div className="space-y-2">
          {intervals.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex gap-2 items-center">
              <Input className="flex-1" placeholder="Name (z.B. daily)" value={item.name} onChange={(e) => updateInterval(i, 'name', e.target.value)} />
              <Input type="number" className="w-16 text-center" value={item.days} onChange={(e) => updateInterval(i, 'days', Number(e.target.value))} />
              <span className="text-sm text-slate-400">Tage</span>
              <button onClick={() => removeInterval(i)} className="text-red-400 hover:text-red-600 text-lg px-1">\u00d7</button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addInterval}>+ Intervall hinzuf\u00fcgen</Button>
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
