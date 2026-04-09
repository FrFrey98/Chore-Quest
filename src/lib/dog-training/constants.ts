import type { SkillStatus, TrainingRating } from "./types"

export const DECAY_RATES: Record<SkillStatus, number> = {
  new: 0,
  acquisition: 0.15,
  fluency: 0.07,
  proficiency: 0.03,
  maintenance: 0.01,
  mastery: 0.003,
}

export const RATING_BOOSTS: Record<TrainingRating, number> = {
  poor: 0.02,
  okay: 0.08,
  good: 0.15,
}

export const RATING_NUMERIC: Record<TrainingRating, number> = {
  poor: 0,
  okay: 1,
  good: 2,
}

export type StatusRequirement = {
  minSessions: number
  minDays: number
}

export const STATUS_REQUIREMENTS: Record<Exclude<SkillStatus, "new">, StatusRequirement> = {
  acquisition: { minSessions: 1, minDays: 0 },
  fluency: { minSessions: 5, minDays: 0 },
  proficiency: { minSessions: 10, minDays: 14 },
  maintenance: { minSessions: 20, minDays: 60 },
  mastery: { minSessions: 40, minDays: 180 },
}

export const DAILY_POINT_CAP = 40
export const POINTS_BASE_PER_MINUTE = 0.5
export const POINTS_PER_SKILL = 3

export const CHALLENGE_MULTIPLIERS: Record<0 | 1 | 2 | 3, number> = {
  0: 1.0,
  1: 1.1,
  2: 1.2,
  3: 1.5,
}

export const STATUS_PROGRESS_RANK: Record<SkillStatus, number> = {
  new: 0,
  acquisition: 1,
  fluency: 2,
  proficiency: 3,
  maintenance: 4,
  mastery: 5,
}

export const PILLAR_HEALTH_BANDS = {
  success: 75,
  accent: 40,
  warning: 15,
} as const

export const ALLOWED_DURATIONS = [5, 10, 15, 20, 30] as const
