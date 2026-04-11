"use client"

type Props = {
  sessionCounts: Record<string, number>
}

export function TrainingHeatmap({ sessionCounts }: Props) {
  const today = new Date()
  const cellSize = 12
  const gap = 2
  const weeks = 13

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - weeks * 7 + 1)
  const dayOfWeek = startDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startDate.setDate(startDate.getDate() + mondayOffset)

  const cells: Array<{ x: number; y: number; date: string; count: number }> = []
  const current = new Date(startDate)

  for (let week = 0; week <= weeks; week++) {
    for (let day = 0; day < 7; day++) {
      if (current > today) break
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
      cells.push({ x: week * (cellSize + gap), y: day * (cellSize + gap), date: key, count: sessionCounts[key] ?? 0 })
      current.setDate(current.getDate() + 1)
    }
  }

  function color(count: number): string {
    if (count === 0) return "rgba(255,255,255,0.04)"
    if (count === 1) return "rgba(99,102,241,0.3)"
    if (count === 2) return "rgba(99,102,241,0.5)"
    return "rgba(99,102,241,0.8)"
  }

  const svgWidth = (weeks + 1) * (cellSize + gap)
  const svgHeight = 7 * (cellSize + gap)

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="block">
        {cells.map((c) => (
          <rect key={c.date} x={c.x} y={c.y} width={cellSize} height={cellSize} rx={2} fill={color(c.count)}>
            <title>{c.date}: {c.count} Sessions</title>
          </rect>
        ))}
      </svg>
    </div>
  )
}
