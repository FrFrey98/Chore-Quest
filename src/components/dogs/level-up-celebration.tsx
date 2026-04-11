"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

type LevelUp = {
  skillId: string
  skillName: string
  oldStatus: string
  newStatus: string
}

type Props = {
  levelUps: LevelUp[]
  onDone: () => void
}

export function LevelUpCelebration({ levelUps, onDone }: Props) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current || levelUps.length === 0) return
    fired.current = true

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"],
    })

    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [levelUps, onDone])

  if (levelUps.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-card rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 text-center space-y-4">
        <div className="text-4xl">🎉</div>
        <h2 className="text-lg font-bold">Level Up!</h2>
        <div className="space-y-2">
          {levelUps.map((lu) => (
            <div key={lu.skillId} className="text-sm">
              <span className="font-bold">{lu.skillName}</span>
              <div className="text-muted-foreground text-xs">
                {lu.oldStatus} → <span className="text-green-500 font-medium">{lu.newStatus}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onDone} className="text-sm text-muted-foreground underline">
          Weiter
        </button>
      </div>
    </div>
  )
}
