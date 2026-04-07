'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

type HeatmapProps = {
  data: Record<string, number>
  from?: string // 'YYYY-MM-DD'
  to?: string   // 'YYYY-MM-DD'
}

const DEFAULT_WEEKS = 26

export function Heatmap({ data, from, to }: HeatmapProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const emptyColor = isDark ? '#1e293b' : '#e2e8f0'

  function getColor(points: number): string {
    if (points === 0) return emptyColor
    if (points < 50) return '#c7d2fe'
    if (points < 150) return '#818cf8'
    if (points < 300) return '#6366f1'
    return '#4338ca'
  }

  let startDate: Date
  let totalDays: number

  if (from && to) {
    startDate = new Date(from + 'T00:00:00Z')
    const endDate = new Date(to + 'T00:00:00Z')
    totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
  } else {
    const today = new Date()
    totalDays = DEFAULT_WEEKS * 7
    startDate = new Date(today)
    startDate.setUTCDate(startDate.getUTCDate() - totalDays + 1)
  }

  const weeks = Math.ceil(totalDays / 7)
  const days: { date: string; points: number }[] = []

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate)
    d.setUTCDate(d.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, points: data[key] ?? 0 })
  }

  return (
    <div
      className="grid gap-1 overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${weeks}, 12px)`, gridTemplateRows: 'repeat(7, 12px)' }}
    >
      {days.map(({ date, points }) => (
        <div
          key={date}
          title={`${date}: ${points} Pkt`}
          className="rounded-sm"
          style={{ width: 12, height: 12, background: getColor(points) }}
        />
      ))}
    </div>
  )
}
