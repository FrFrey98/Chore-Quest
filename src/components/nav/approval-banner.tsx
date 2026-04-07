'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Shield } from 'lucide-react'
import { hasPermission } from '@/lib/permissions'

export function ApprovalBanner() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations('nav')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.role || !hasPermission(session.user.role as any, 'approveTasks')) return
    const controller = new AbortController()
    fetch('/api/approvals/count', { signal: controller.signal })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setCount(d.count ?? 0))
      .catch(() => {})
    return () => controller.abort()
  }, [pathname, session])

  if (!session?.user?.role || !hasPermission(session.user.role as any, 'approveTasks')) return null
  if (count === 0) return null

  return (
    <Link
      href="/approvals"
      className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium mb-4 hover:bg-indigo-100 transition-colors"
    >
      <Shield size={16} />
      <span>{t('approvalCount', { count })}</span>
    </Link>
  )
}
