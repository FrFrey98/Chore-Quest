'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig } from '@/lib/config'

type IntervalEntry = { name: string; days: number }
type DecayEntry = { name: string; hours: number }

export function BonusTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const t = useTranslations('settings.bonus')
  const tc = useTranslations('common')
  const [teamworkPercent, setTeamworkPercent] = useState(config.teamworkBonusPercent)
  const [intervals, setIntervals] = useState<IntervalEntry[]>(
    Object.entries(config.recurringIntervals).map(([name, days]) => ({ name, days }))
  )
  const [decayEnabled, setDecayEnabled] = useState(config.pointDecayEnabled)
  const [decayHours, setDecayHours] = useState<DecayEntry[]>(
    Object.entries(config.decayHoursByInterval).map(([name, hours]) => ({ name, hours }))
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
    const decayObj: Record<string, number> = {}
    for (const item of decayHours) {
      if (item.name.trim()) decayObj[item.name.trim()] = item.hours
    }
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [
          { key: 'teamwork_bonus_percent', value: teamworkPercent },
          { key: 'recurring_intervals', value: intervalsObj },
          { key: 'point_decay_enabled', value: decayEnabled },
          { key: 'decay_hours_by_interval', value: decayObj },
        ],
      }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg(tc('saved'))
      setIntervals(Object.entries(intervalsObj).map(([name, days]) => ({ name, days })))
      router.refresh()
    } else {
      setMsg(tc('saveFailed'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-1">{t('teamworkHeading')}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t('teamworkDescription')}</p>
        <div className="flex items-center gap-2">
          <Input type="number" className="w-20 text-center" value={teamworkPercent} onChange={(e) => setTeamworkPercent(Number(e.target.value))} />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">{t('intervalsHeading')}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t('intervalsDescription')}</p>
        <div className="space-y-2">
          {intervals.map((item, i) => (
            <div key={i} className="bg-card rounded-lg p-3 shadow-sm flex gap-2 items-center">
              <Input className="flex-1" placeholder={t('intervalNamePlaceholder')} value={item.name} onChange={(e) => updateInterval(i, 'name', e.target.value)} />
              <Input type="number" className="w-16 text-center" value={item.days} onChange={(e) => updateInterval(i, 'days', Number(e.target.value))} />
              <span className="text-sm text-muted-foreground">{t('daysLabel')}</span>
              <button onClick={() => removeInterval(i)} className="text-danger hover:text-danger text-lg px-1">×</button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addInterval}>{t('addInterval')}</Button>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-1">{t('decayHeading')}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t('decayDescription')}</p>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="decay-enabled"
            checked={decayEnabled}
            onChange={(e) => setDecayEnabled(e.target.checked)}
          />
          <label htmlFor="decay-enabled" className="text-sm">{t('decayEnabled')}</label>
        </div>
        {decayEnabled && (
          <>
            <p className="text-sm text-muted-foreground mb-2">{t('decayHoursDescription')}</p>
            <div className="space-y-2">
              {decayHours.map((item, i) => (
                <div key={i} className="bg-card rounded-lg p-3 shadow-sm flex gap-2 items-center">
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  <Input
                    type="number"
                    className="w-20 text-center"
                    min={1}
                    value={item.hours}
                    onChange={(e) =>
                      setDecayHours((prev) =>
                        prev.map((d, j) => (j === i ? { ...d, hours: Number(e.target.value) } : d))
                      )
                    }
                  />
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
              ))}
            </div>
          </>
        )}
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
