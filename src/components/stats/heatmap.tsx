type HeatmapProps = { data: Record<string, number> }

const MAX_WEEKS = 26 // half year

function getColor(points: number): string {
  if (points === 0) return '#e2e8f0'
  if (points < 50) return '#c7d2fe'
  if (points < 150) return '#818cf8'
  if (points < 300) return '#6366f1'
  return '#4338ca'
}

export function Heatmap({ data }: HeatmapProps) {
  const today = new Date()
  const days: { date: string; points: number }[] = []

  for (let i = MAX_WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, points: data[key] ?? 0 })
  }

  return (
    <div
      className="grid gap-1 overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${MAX_WEEKS}, 12px)`, gridTemplateRows: 'repeat(7, 12px)' }}
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
