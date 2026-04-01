'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast-provider'

type PendingPurchase = {
  id: string
  purchasedAt: string
  user: { id: string; name: string | null }
  item: { title: string; emoji: string }
}

export function PendingRewards({
  purchases,
  currentUserId,
}: {
  purchases: PendingPurchase[]
  currentUserId: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (purchases.length === 0) return null

  const mine = purchases.filter((p) => p.user.id === currentUserId)
  const theirs = purchases.filter((p) => p.user.id !== currentUserId)

  async function handleRedeem(purchaseId: string) {
    setLoadingId(purchaseId)
    try {
      const res = await fetch(`/api/store/${purchaseId}/redeem`, { method: 'POST' })
      if (res.ok) {
        toast('Belohnung als eingelöst markiert', 'success')
        router.refresh()
      } else {
        const data = await res.json()
        toast(data.error ?? 'Fehler', 'error')
      }
    } catch {
      toast('Netzwerkfehler', 'error')
    }
    setLoadingId(null)
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        🎯 Offene Belohnungen
      </h2>
      <div className="space-y-2">
        {mine.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span className="text-2xl">{p.item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.item.title}</p>
              <p className="text-xs text-amber-600">Wartet auf Einlösung durch deinen Partner</p>
            </div>
          </div>
        ))}
        {theirs.map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <span className="text-2xl">{p.item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.item.title}</p>
              <p className="text-xs text-green-600">{p.user.name ?? 'Unbekannt'} möchte das einlösen</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleRedeem(p.id)}
              disabled={loadingId === p.id}
            >
              {loadingId === p.id ? '…' : 'Einlösen'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
