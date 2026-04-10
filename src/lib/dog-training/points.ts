import type { TrainingRating } from "./types"
import {
  DAILY_POINT_CAP,
  POINTS_BASE_PER_MINUTE,
  POINTS_PER_SKILL,
  CHALLENGE_MULTIPLIERS,
  RATING_NUMERIC,
} from "./constants"

export type SessionSkillInput = {
  skillDefinitionId: string
  rating: TrainingRating
}

export type CalculatePointsInput = {
  durationMinutes: number
  skills: SessionSkillInput[]
  recommendedSkillIds: string[]
  pointsEarnedTodayForDog: number
}

export type CalculatePointsResult = {
  points: number
  basePoints: number
  skillBonus: number
  qualityBonus: number
  multiplier: number
  challengeMatches: number
  capped: boolean
}

export function calculateSessionPoints(
  input: CalculatePointsInput,
): CalculatePointsResult {
  const basePoints = input.durationMinutes * POINTS_BASE_PER_MINUTE
  const skillCount = input.skills.length
  const skillBonus = skillCount * POINTS_PER_SKILL

  const avgRating =
    skillCount === 0
      ? 0
      : input.skills.reduce((sum, s) => sum + RATING_NUMERIC[s.rating], 0) /
        skillCount
  const qualityBonus = skillCount * avgRating

  const matchSet = new Set(input.recommendedSkillIds)
  const challengeMatches = input.skills.filter((s) =>
    matchSet.has(s.skillDefinitionId),
  ).length

  const clampedMatches = Math.max(0, Math.min(3, challengeMatches)) as 0 | 1 | 2 | 3
  const multiplier = CHALLENGE_MULTIPLIERS[clampedMatches]

  const rawBeforeCap = Math.round(
    (basePoints + skillBonus + qualityBonus) * multiplier,
  )

  const capRemaining = Math.max(0, DAILY_POINT_CAP - input.pointsEarnedTodayForDog)
  const points = Math.max(0, Math.min(rawBeforeCap, capRemaining))

  return {
    points,
    basePoints,
    skillBonus,
    qualityBonus,
    multiplier,
    challengeMatches,
    capped: rawBeforeCap > capRemaining,
  }
}
