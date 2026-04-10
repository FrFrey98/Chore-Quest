"use client"

type PillarData = {
  id: string
  name: string
  emoji: string
  health: number
}

type Props = {
  pillars: PillarData[]
  activePillarId?: string
}

export function RadarChart({ pillars, activePillarId }: Props) {
  const cx = 120
  const cy = 120
  const maxR = 90
  const n = pillars.length
  if (n === 0) return null

  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  function point(i: number, r: number): [number, number] {
    const angle = startAngle + i * angleStep
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  const rings = [0.25, 0.5, 0.75, 1.0]
  const dataPoints = pillars.map((p, i) => point(i, (p.health / 100) * maxR))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z"

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 240 240" className="w-[140px] h-[140px] flex-shrink-0">
        {rings.map((r) => (
          <polygon
            key={r}
            points={pillars.map((_, i) => point(i, r * maxR).join(",")).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        ))}
        {pillars.map((_, i) => {
          const [x, y] = point(i, maxR)
          return (
            <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          )
        })}
        <polygon
          points={dataPoints.map((p) => p.join(",")).join(" ")}
          fill="rgba(99,102,241,0.15)"
          stroke="rgba(99,102,241,0.6)"
          strokeWidth="1.5"
        />
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={pillars[i].id === activePillarId ? 4 : 2.5}
            fill={pillars[i].id === activePillarId ? "rgb(99,102,241)" : "rgba(99,102,241,0.8)"}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-1.5">
        {pillars.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              p.health >= 75 ? "bg-green-500" : p.health >= 40 ? "bg-blue-500" : p.health >= 15 ? "bg-amber-500" : "bg-red-500"
            }`} />
            <span className={`text-xs ${p.id === activePillarId ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              {p.name}
            </span>
            <span className="text-xs text-muted-foreground/60">{Math.round(p.health)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
