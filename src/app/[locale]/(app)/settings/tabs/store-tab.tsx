'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }

export function StoreTab({ storeItems }: { storeItems: StoreItem[] }) {
  const router = useRouter()
  const t = useTranslations('settings.store')
  const tc = useTranslations('common')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', emoji: '🎁', description: '', pointCost: 500, type: 'real_reward',
  })

  async function createItem() {
    setError('')
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isActive: true }),
    })
    if (res.ok) {
      setForm((prev) => ({ ...prev, title: '', description: '' }))
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? t('createFailed'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold">{t('newHeading')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('emoji')}</Label>
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          </div>
          <div>
            <Label>{t('price')}</Label>
            <Input type="number" value={form.pointCost} onChange={(e) => setForm({ ...form, pointCost: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label>{t('title')}</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>{t('description')}</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <Label>{t('type')}</Label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="trophy">{t('typeTrophy')}</option>
            <option value="real_reward">{t('typeReward')}</option>
          </select>
        </div>
        <Button onClick={createItem} disabled={!form.title || !form.description}>
          {t('submitButton')}
        </Button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">{t('existingHeading')}</h2>
      <div className="space-y-2">
        {storeItems.filter((i) => i.type !== 'streak_restore').map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
            <span>{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-slate-400">{item.pointCost} {tc('points')} · {item.type}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {item.isActive ? tc('active') : tc('inactive')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
