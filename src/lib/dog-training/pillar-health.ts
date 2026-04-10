import type { SkillStatus } from "./types"
import { statusRank } from "./status"
import { PILLAR_HEALTH_BANDS } from "./constants"

export type PillarSkillState = {
  status: SkillStatus
  progress: number
  trainedCount: number
}

export function calculatePillarHealth(skills: PillarSkillState[]): number {
  const trained = skills.filter((s) => s.trainedCount > 0)
  if (trained.length === 0) return 0
  const avg =
    trained.reduce((sum, s) => {
      const rank = statusRank(s.status)
      return sum + Math.min((rank + s.progress) / 5, 1)
    }, 0) / trained.length
  return Math.round(avg * 100)
}

export type HealthBand = "success" | "accent" | "warning" | "danger"

export function healthBand(health: number): HealthBand {
  if (health >= PILLAR_HEALTH_BANDS.success) return "success"
  if (health >= PILLAR_HEALTH_BANDS.accent) return "accent"
  if (health >= PILLAR_HEALTH_BANDS.warning) return "warning"
  return "danger"
}
