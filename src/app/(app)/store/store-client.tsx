'use client'
import { useRouter } from 'next/navigation'
import { StoreItemCard } from '@/components/store/store-item-card'
import { CreateItemDialog } from '@/components/store/create-item-dialog'
import { useToast } from '@/components/toast-provider'
import type { StoreItem } from '@/components/store/store-item-card'

export function StoreClient({
  trophies, rewards, balance,
}: {
  trophies: StoreItem[]; rewards: StoreItem[]; balance: number
}) {
  const router = useRouter()
  const { toast } = useToast()

  async function handlePurchase(itemId: string) {
    const res = await fetch(`/api/store/${itemId}/purchase`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Fehler beim Kauf' }
    router.refresh()
    toast('Erfolgreich gekauft!', 'success')
    return {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Store</h1>
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 font-semibold">{balance.toLocaleString()} Pkt</span>
          <CreateItemDialog />
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🏆 Trophäen
      </h2>
      <div className="space-y-3 mb-8">
        {trophies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-slate-400 text-sm">Noch keine Trophäen verfügbar.</p>
            <p className="text-slate-400 text-xs mt-1">Erstelle welche über den + Button oben.</p>
          </div>
        )}
        {trophies.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🎁 Belohnungen
      </h2>
      <div className="space-y-3">
        {rewards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-slate-400 text-sm">Noch keine Belohnungen verfügbar.</p>
            <p className="text-slate-400 text-xs mt-1">Erstelle welche über den + Button oben.</p>
          </div>
        )}
        {rewards.map((item) => (
          <StoreItemCard key={item.id} item={item} userBalance={balance} onPurchase={handlePurchase} />
        ))}
      </div>
    </div>
  )
}
