'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

type PersonalDataPoint = { date: string; count: number; points: number }
type ComparisonDataPoint = { date: string; userCount: number; userPoints: number; partnerCount: number; partnerPoints: number }

type ActivityChartProps = {
  mode: 'personal' | 'comparison'
  metric: 'count' | 'points'
  personalData?: PersonalDataPoint[]
  comparisonData?: ComparisonDataPoint[]
  userName?: string
  partnerName?: string
  tasksLabel?: string
  pointsLabel?: string
}

const tooltipStyle = {
  light: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' },
  dark: { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' },
}

export function ActivityChart({ mode, metric, personalData, comparisonData, userName, partnerName, tasksLabel = 'Tasks', pointsLabel = 'Points' }: ActivityChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const gridColor = isDark ? '#334155' : '#f1f5f9'
  const tooltip = isDark ? tooltipStyle.dark : tooltipStyle.light

  if (mode === 'personal' && personalData) {
    const dataKey = metric === 'count' ? 'count' : 'points'
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={personalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltip}
            labelFormatter={(v) => String(v)}
            formatter={(value) => [value, metric === 'count' ? tasksLabel : pointsLabel]}
          />
          <Line type="monotone" dataKey={dataKey} stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#818cf8' }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (mode === 'comparison' && comparisonData) {
    const userKey = metric === 'count' ? 'userCount' : 'userPoints'
    const partnerKey = metric === 'count' ? 'partnerCount' : 'partnerPoints'
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltip}
            labelFormatter={(v) => String(v)}
            formatter={(value, name) => [
              value,
              name === userKey ? (userName ?? 'Ich') : (partnerName ?? 'Partner'),
            ]}
          />
          <Bar dataKey={userKey} stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} name={userKey} />
          <Bar dataKey={partnerKey} stackId="a" fill="#f472b6" radius={[4, 4, 0, 0]} name={partnerKey} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return null
}
