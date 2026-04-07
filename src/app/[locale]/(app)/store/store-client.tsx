'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { StoreItemCard } from '@/components/store/store-item-card'
import { CreateItemDialog } from '@/components/store/create-item-dialog'
import { MyRewards } from '@/components/store/pending-rewards'
import { useToast } from '@/components/toast-provider'
import type { StoreItem } from '@/components/store/store-item-card'

type PendingPurchase = {
  id: string
  purchasedAt: string
  item: { title: string; emoji: string }
}

export function StoreClient({
  rewards, balance, myPendingPurchases,
}: {
  rewards: StoreItem[]; balance: number
  myPendingPurchases: PendingPurchase[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('store')
  const tc = useTranslations('common')

  async function handlePurchase(itemId: string) {
    try {
      const res = await fetch(`/api/store/${itemId}/purchase`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) return { error: data.error ?? t('purchaseFailed') }
      router.refresh()
      toast(t('purchaseSuccess'), 'success')
      return {}
    } catch {
      return { error: tc('networkError') }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t('heading')}</h1>
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 font-semibold">{balance.toLocaleString()} {tc('points')}</span>
          <CreateItemDialog />
        </div>
      </div>

      <MyRewards purchases={myPendingPurchases} />

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {t('rewards')}
      </h2>
      <div className="space-y-3">
        {rewards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-slate-400 text-sm">{t('noRewards')}</p>
            <p className="text-slate-400 text-xs mt-1">{t('createHint')}</p>
          </div>
        )}
        {rewards.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Link href="/manage?tab=rewards" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
          {t('manage')}
        </Link>
      </div>
    </div>
  )
}
