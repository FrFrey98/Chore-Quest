'use client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function YesterdayBanner({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <Link href="/tasks/yesterday">
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 hover:bg-amber-100 transition-colors cursor-pointer">
        <span className="text-lg">📋</span>
        <span className="flex-1 text-sm font-medium text-amber-800">
          {count} {count === 1 ? 'Aufgabe' : 'Aufgaben'} von gestern nachtragen
        </span>
        <ChevronRight size={16} className="text-amber-400" />
      </div>
    </Link>
  )
}
