'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = { byCategory: Record<string, Record<string, number>>; categories: { id: string; name: string }[] }

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function CategoryPieChart({ byCategory, categories }: Props) {
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
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
