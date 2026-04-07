'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = { byCategory: Record<string, Record<string, number>>; categories: { id: string; name: string }[] }

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function CategoryPieChart({ byCategory, categories }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const tooltip = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }
    : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }

  const data = Object.entries(byCategory).map(([catId, users]) => {
    const cat = categories.find((c) => c.id === catId)
    return {
      name: cat?.name ?? catId,
      value: Object.values(users).reduce((s, v) => s + v, 0),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
