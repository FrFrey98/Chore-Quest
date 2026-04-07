'use client'

import { useEffect, useState } from 'react'
import { calculateHealth, getHealthColor, shouldPulse } from '@/lib/health'

interface HealthBarProps {
  nextDueAt: string | null
  decayHours: number
  vacationStart?: string | null
  vacationEnd?: string | null
}

export function HealthBar({ nextDueAt, decayHours, vacationStart, vacationEnd }: HealthBarProps) {
  const [health, setHealth] = useState(() => calculateHealth(nextDueAt, decayHours, new Date(), vacationStart, vacationEnd))

  useEffect(() => {
    if (!nextDueAt) return
    const update = () => setHealth(calculateHealth(nextDueAt, decayHours, new Date(), vacationStart, vacationEnd))
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [nextDueAt, decayHours, vacationStart, vacationEnd])

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
