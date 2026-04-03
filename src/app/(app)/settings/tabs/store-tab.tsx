'use client'
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
export function StoreTab({ storeItems }: { storeItems: StoreItem[] }) {
  return <div className="text-slate-400 text-sm">Store-Tab ({storeItems.length} Items)</div>
}
