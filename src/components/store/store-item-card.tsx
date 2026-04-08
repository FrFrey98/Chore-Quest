'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export type StoreItem = {
  id: string; title: string; description: string; emoji: string
  pointCost: number; type: string
}

export function StoreItemCard({
  item,
  userBalance,
  onPurchase,
}: {
  item: StoreItem
  userBalance: number
  onPurchase: (id: string) => Promise<{ error?: string }>
}) {
  const t = useTranslations('store')
  const tc = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [error, setError] = useState('')
  const canAfford = userBalance >= item.pointCost

  async function handlePurchase() {
    setLoading(true)
    setError('')
    const res = await onPurchase(item.id)
    if (res.error) {
      setError(res.error)
    } else {
      setPurchased(true)
    }
    setLoading(false)
  }

  return (
    <div className={`bg-card rounded-xl shadow-sm p-4 space-y-2${purchased ? ' opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0">
          {item.pointCost} {tc('points')}
        </span>
      </div>
      {error && <p className="text-danger text-xs">{error}</p>}
      {purchased ? (
        <p className="text-success text-sm font-medium">{t('purchased')}</p>
      ) : (
        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={loading || !canAfford}
          variant={canAfford ? 'default' : 'outline'}
        >
          {loading ? '…' : canAfford ? t('buy') : t('notEnoughPoints')}
        </Button>
      )}
    </div>
  )
}
