'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast-provider'

type PendingPurchase = {
  id: string
  purchasedAt: string
  item: { title: string; emoji: string }
}

export function MyRewards({ purchases }: { purchases: PendingPurchase[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('store')
  const tc = useTranslations('common')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (purchases.length === 0) return null

  async function handleRedeem(purchaseId: string) {
    setLoadingId(purchaseId)
    try {
      const res = await fetch(`/api/store/${purchaseId}/redeem`, { method: 'POST' })
      if (res.ok) {
        toast(t('redeemed'), 'success')
        router.refresh()
      } else {
        const data = await res.json()
        toast(data.error ?? t('redeemFailed'), 'error')
      }
    } catch {
      toast(tc('networkError'), 'error')
    }
    setLoadingId(null)
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {t('myRewards')}
      </h2>
      <div className="space-y-2">
        {purchases.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span className="text-2xl">{p.item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.item.title}</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleRedeem(p.id)}
              disabled={loadingId === p.id}
            >
              {loadingId === p.id ? '…' : t('redeem')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
