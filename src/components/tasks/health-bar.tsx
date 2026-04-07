'use client'

import { useEffect, useState } from 'react'
import { calculateHealth, getHealthColor, shouldPulse } from '@/lib/health'

interface HealthBarProps {
  nextDueAt: string | null
  decayHours: number
}

export function HealthBar({ nextDueAt, decayHours }: HealthBarProps) {
  const [health, setHealth] = useState(() => calculateHealth(nextDueAt, decayHours))

  useEffect(() => {
    if (!nextDueAt) return
    const update = () => setHealth(calculateHealth(nextDueAt, decayHours))
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [nextDueAt, decayHours])

  if (!nextDueAt || health >= 1) return null

  const colorClass = getHealthColor(health)
  const pulse = shouldPulse(health)
  const widthPercent = Math.max(2, health * 100)

  return (
    <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${colorClass} ${pulse ? 'animate-pulse' : ''}`}
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  )
}
