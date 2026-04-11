"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { LevelUpCelebration } from "./level-up-celebration"

type LevelUp = {
  skillId: string
  skillName: string
  oldStatus: string
  newStatus: string
}

type Achievement = {
  id: string
  titleDe: string
  emoji: string
}

type Props = {
  pointsAwarded: number
  capped: boolean
  levelUps: LevelUp[]
  newAchievements: Achievement[]
  onClose: () => void
}

export function SessionSummary({ pointsAwarded, capped, levelUps, newAchievements, onClose }: Props) {
  const t = useTranslations("dogTraining")
  const [displayPoints, setDisplayPoints] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(levelUps.length > 0)

  useEffect(() => {
    if (showLevelUp) return
    const target = pointsAwarded
    const duration = 800
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplayPoints(Math.round(target * progress))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [pointsAwarded, showLevelUp])

  if (showLevelUp) {
    return <LevelUpCelebration levelUps={levelUps} onDone={() => setShowLevelUp(false)} />
  }

  return (
    <div className="space-y-6 py-4 text-center">
      <div>
        <div className="text-5xl font-bold">{displayPoints}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {t("modal.points")}
          {capped && <span className="text-amber-500 ml-2">({t("modal.cap")})</span>}
        </div>
      </div>

      {newAchievements.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("celebration.newAchievements")}
          </div>
          {newAchievements.map((a) => (
            <div key={a.id} className="flex items-center justify-center gap-2 text-sm">
              <span className="text-lg">{a.emoji}</span>
              <span className="font-medium">{a.titleDe}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onClose}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
      >
        {t("celebration.continue")}
      </button>
    </div>
  )
}
