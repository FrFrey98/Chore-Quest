'use client'
// src/components/dashboard/week-chart.tsx
import { useTranslations } from 'next-intl'

type DayData = {
  day: string // 'Mo', 'Di', etc.
  userCount: number
  partnerCount: number
  isFuture: boolean
}

type WeekChartProps = {
  days: DayData[]
  userName: string
  partnerName: string
}

export function WeekChart({ days, userName, partnerName }: WeekChartProps) {
  const t = useTranslations('dashboard')
  const max = Math.max(1, ...days.map((d) => Math.max(d.userCount, d.partnerCount)))

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground mb-3">
        {t('weekOverview')}
      </h2>
      <div className="flex items-end gap-1.5" style={{ height: '80px' }}>
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
            <div className="flex gap-[2px] w-full items-end" style={{ height: '60px' }}>
              <div
                className={`flex-1 rounded-t-sm ${d.isFuture ? 'bg-muted' : 'bg-accent'}`}
                style={{ height: `${d.isFuture ? 4 : Math.max(4, (d.userCount / max) * 60)}px` }}
              />
              <div
                className={`flex-1 rounded-t-sm ${d.isFuture ? 'bg-muted' : 'bg-partner'}`}
                style={{ height: `${d.isFuture ? 4 : Math.max(4, (d.partnerCount / max) * 60)}px` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
          <span className="text-[10px] text-muted-foreground">{userName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-partner" />
          <span className="text-[10px] text-muted-foreground">{partnerName}</span>
        </div>
      </div>
    </div>
  )
}
