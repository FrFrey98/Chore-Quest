'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type GameConfig, type LevelDef } from '@/lib/config'

export function LevelTab({ config }: { config: GameConfig }) {
  const router = useRouter()
  const t = useTranslations('settings.levels')
  const tc = useTranslations('common')
  const [levels, setLevels] = useState<LevelDef[]>([...config.levelDefinitions])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateLevel(index: number, field: keyof LevelDef, value: string | number) {
    setLevels((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function removeLevel(index: number) {
    if (index === 0) return
    setLevels((prev) => prev.filter((_, i) => i !== index))
  }

  function addLevel() {
    const nextNum = levels.length + 1
    const lastPoints = levels[levels.length - 1]?.minPoints ?? 0
    setLevels((prev) => [...prev, { level: nextNum, minPoints: lastPoints + 1000, title: '' }])
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const sorted = [...levels]
      .sort((a, b) => a.minPoints - b.minPoints)
      .map((l, i) => ({ ...l, level: i + 1 }))
    const res = await fetch('/api/settings/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: [{ key: 'level_definitions', value: sorted }] }),
    })
    setSaving(false)
    if (res.ok) {
      setLevels(sorted)
      setMsg(tc('saved'))
      router.refresh()
    } else {
      setMsg(tc('saveFailed'))
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <div className="space-y-2">
        {levels.map((level, i) => (
          <div key={i} className="bg-card rounded-lg p-3 shadow-sm flex gap-2 items-center flex-wrap">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">Lv.{level.level}</span>
            <Input
              className="flex-1 min-w-[120px]"
              placeholder={t('titlePlaceholder')}
              value={level.title}
              onChange={(e) => updateLevel(i, 'title', e.target.value)}
            />
            {i === 0 ? (
              <span className="text-xs text-muted-foreground">{t('fromZero')}</span>
            ) : (
              <>
                <label className="text-xs text-muted-foreground">{t('from')}</label>
                <Input
                  type="number"
                  className="w-20 text-center"
                  value={level.minPoints}
                  onChange={(e) => updateLevel(i, 'minPoints', Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">{tc('points')}</span>
                <button onClick={() => removeLevel(i)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
              </>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full" onClick={addLevel}>{t('addLevel')}</Button>

      <div className="flex items-center justify-between">
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? tc('saving') : tc('save')}
        </Button>
      </div>
    </div>
  )
}
