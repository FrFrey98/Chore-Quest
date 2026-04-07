'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = { byWeek: Record<string, Record<string, number>> }

export function ComparisonChart({ byWeek }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const tooltip = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }
    : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }

  const data = Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, users]) => ({ week: week.slice(5), ...users }))

  const names = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== 'week')
    : []

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={tooltip} />
        <Legend />
        {names.map((name, i) => (
          <Bar key={name} dataKey={name} fill={i === 0 ? '#6366f1' : '#ec4899'} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
