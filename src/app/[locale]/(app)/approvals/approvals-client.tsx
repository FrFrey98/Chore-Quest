'use client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ApprovalCard } from '@/components/approvals/approval-card'
import type { Approval } from '@/components/approvals/approval-card'

export function ApprovalsClient({ approvals }: { approvals: Approval[] }) {
  const router = useRouter()
  const t = useTranslations('approvals')

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const res = await fetch(`/api/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) throw new Error(t('actionFailed'))
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t('heading')}</h1>
      {approvals.length > 0 && (
        <p className="text-sm text-muted-foreground mb-6">{t('openCount', { count: approvals.length })}</p>
      )}
      {approvals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-foreground">{t('allApproved')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('allApprovedSubtitle')}
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
