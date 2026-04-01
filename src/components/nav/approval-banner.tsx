'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield } from 'lucide-react'

export function ApprovalBanner() {
  const pathname = usePathname()
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/approvals/count')
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setCount(d.count ?? 0))
      .catch(() => {})
  }, [pathname])

  if (count === 0) return null

  return (
    <Link
      href="/approvals"
      className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium mb-4 hover:bg-indigo-100 transition-colors"
    >
      <Shield size={16} />
      <span>{count} {count === 1 ? 'Freigabe' : 'Freigaben'} offen</span>
    </Link>
  )
}
