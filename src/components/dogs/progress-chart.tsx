"use client"

type WeeklyData = {
  weekLabel: string
  points: number
}

type Props = {
  weeklyPoints: WeeklyData[]
}

export function ProgressChart({ weeklyPoints }: Props) {
  if (weeklyPoints.length === 0) return null

  const maxPoints = Math.max(...weeklyPoints.map((w) => w.points), 1)
  const barWidth = 24
  const gap = 4
  const chartHeight = 100
  const svgWidth = weeklyPoints.length * (barWidth + gap)

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={chartHeight + 20} className="block">
        {weeklyPoints.map((w, i) => {
          const barHeight = (w.points / maxPoints) * chartHeight
          const x = i * (barWidth + gap)
          const y = chartHeight - barHeight
          return (
            <g key={w.weekLabel}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} fill="rgba(99,102,241,0.5)">
                <title>{w.weekLabel}: {w.points} Punkte</title>
              </rect>
              <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">
                {w.weekLabel}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
