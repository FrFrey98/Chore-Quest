import { describe, it, expect } from "vitest"
import {
  DECAY_RATES,
  RATING_BOOSTS,
  STATUS_REQUIREMENTS,
  DAILY_POINT_CAP,
  POINTS_BASE_PER_MINUTE,
  POINTS_PER_SKILL,
  CHALLENGE_MULTIPLIERS,
} from "@/lib/dog-training/constants"

describe("dog training constants", () => {
  it("defines decay rate for each non-new status", () => {
    expect(DECAY_RATES.new).toBe(0)
    expect(DECAY_RATES.acquisition).toBeGreaterThan(DECAY_RATES.fluency)
    expect(DECAY_RATES.fluency).toBeGreaterThan(DECAY_RATES.proficiency)
    expect(DECAY_RATES.proficiency).toBeGreaterThan(DECAY_RATES.maintenance)
    expect(DECAY_RATES.maintenance).toBeGreaterThan(DECAY_RATES.mastery)
    expect(DECAY_RATES.mastery).toBeGreaterThan(0)
  })

  it("orders rating boosts good > okay > poor", () => {
    expect(RATING_BOOSTS.good).toBeGreaterThan(RATING_BOOSTS.okay)
    expect(RATING_BOOSTS.okay).toBeGreaterThan(RATING_BOOSTS.poor)
  })

  it("defines a daily point cap", () => {
    expect(DAILY_POINT_CAP).toBe(40)
  })

  it("defines point formula coefficients", () => {
    expect(POINTS_BASE_PER_MINUTE).toBe(0.5)
    expect(POINTS_PER_SKILL).toBe(3)
  })

  it("defines status requirements", () => {
    expect(STATUS_REQUIREMENTS.fluency.minSessions).toBe(5)
    expect(STATUS_REQUIREMENTS.proficiency.minDays).toBe(14)
    expect(STATUS_REQUIREMENTS.mastery.minSessions).toBe(40)
  })

  it("defines challenge multipliers by match count", () => {
    expect(CHALLENGE_MULTIPLIERS[0]).toBe(1.0)
    expect(CHALLENGE_MULTIPLIERS[3]).toBe(1.5)
  })
})
