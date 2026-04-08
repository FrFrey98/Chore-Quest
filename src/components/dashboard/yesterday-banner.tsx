'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'

export function YesterdayBanner({ count }: { count: number }) {
  const t = useTranslations('dashboard')
  if (count === 0) return null

  return (
    <Link href="/tasks/yesterday">
      <div className="mb-4 p-3 bg-warning-muted border border-warning/20 rounded-xl flex items-center gap-3 hover:bg-warning/15 transition-colors cursor-pointer">
        <span className="text-lg">📋</span>
        <span className="flex-1 text-sm font-medium text-warning">
          {t('yesterdayBackfill', { count })}
        </span>
        <ChevronRight size={16} className="text-warning" />
      </div>
    </Link>
  )
}
