'use client'
import { useRouter } from 'next/navigation'
import { ApprovalCard } from '@/components/approvals/approval-card'
import type { Approval } from '@/components/approvals/approval-card'

export function ApprovalsClient({ approvals }: { approvals: Approval[] }) {
  const router = useRouter()

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const res = await fetch(`/api/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) throw new Error('Fehler bei der Aktion')
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Freigaben</h1>
      {approvals.length > 0 && (
        <p className="text-sm text-slate-500 mb-6">{approvals.length} offene Anfragen</p>
      )}
      {approvals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-slate-700">Alles freigegeben</p>
          <p className="text-sm text-slate-400 mt-1">
            Keine offenen Anfragen — wenn jemand eine neue Aufgabe vorschlägt, erscheint sie hier.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((a) => (
            <ApprovalCard key={a.id} approval={a} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
