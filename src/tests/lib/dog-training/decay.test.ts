import { describe, it, expect } from "vitest"
import { calculateActiveDays, applyDecay } from "@/lib/dog-training/decay"
import type { SkillStatus } from "@/lib/dog-training/types"

const day = (n: number) => new Date(2026, 0, n, 12, 0, 0)

const vacantDog = { vacationStart: null, vacationEnd: null }

describe("calculateActiveDays", () => {
  it("returns 0 for same day", () => {
    expect(calculateActiveDays(day(1), day(1), vacantDog, [])).toBe(0)
  })

  it("counts 3 full days between day 1 and day 4", () => {
    expect(calculateActiveDays(day(1), day(4), vacantDog, [])).toBe(3)
  })

  it("excludes dog vacation days", () => {
    const dog = { vacationStart: day(2), vacationEnd: day(3) }
    // day(1)->day(5) = 4 days, minus day 2 and day 3 = 2 days
    expect(calculateActiveDays(day(1), day(5), dog, [])).toBe(2)
  })

  it("excludes days when all household users are in vacation", () => {
    const users = [
      { vacationStart: day(2), vacationEnd: day(3) },
      { vacationStart: day(2), vacationEnd: day(3) },
    ]
    expect(calculateActiveDays(day(1), day(5), vacantDog, users)).toBe(2)
  })

  it("does not exclude day if only one of two users is in vacation", () => {
    const users = [
      { vacationStart: day(2), vacationEnd: day(3) },
      { vacationStart: null, vacationEnd: null },
    ]
    expect(calculateActiveDays(day(1), day(5), vacantDog, users)).toBe(4)
  })

  it("returns 0 if from > to", () => {
    expect(calculateActiveDays(day(5), day(1), vacantDog, [])).toBe(0)
  })
})

describe("applyDecay", () => {
  it("returns same progress when 0 days passed", () => {
    const result = applyDecay({
      status: "fluency",
      progress: 0.5,
      bestStatus: "fluency",
      lastTrainedAt: day(1),
      now: day(1),
      dog: vacantDog,
      users: [],
    })
    expect(result.status).toBe("fluency")
    expect(result.progress).toBeCloseTo(0.5)
  })

  it("decays acquisition by 0.15 per day", () => {
    const result = applyDecay({
      status: "acquisition",
      progress: 0.8,
      bestStatus: "acquisition",
      lastTrainedAt: day(1),
      now: day(3),
      dog: vacantDog,
      users: [],
    })
    expect(result.status).toBe("acquisition")
    expect(result.progress).toBeCloseTo(0.5, 5)
  })

  it("cascades downgrade when progress goes below 0", () => {
    const result = applyDecay({
      status: "fluency",
      progress: 0.1,
      bestStatus: "acquisition",
      lastTrainedAt: day(1),
      now: day(5),
      dog: vacantDog,
      users: [],
    })
    expect(result.status).toBe("acquisition")
    expect(result.progress).toBeGreaterThan(0)
  })

  it("respects bestStatus floor — never drops below best", () => {
    const result = applyDecay({
      status: "proficiency",
      progress: 0.0,
      bestStatus: "proficiency",
      lastTrainedAt: day(1),
      now: day(365),
      dog: vacantDog,
      users: [],
    })
    expect(result.status).toBe("proficiency")
    expect(result.progress).toBe(0)
  })

  it("does not decay new status", () => {
    const result = applyDecay({
      status: "new",
      progress: 0,
      bestStatus: "new",
      lastTrainedAt: null,
      now: day(30),
      dog: vacantDog,
      users: [],
    })
    expect(result.status).toBe("new")
    expect(result.progress).toBe(0)
  })

  it("pauses decay during dog vacation", () => {
    const dog = { vacationStart: day(2), vacationEnd: day(4) }
    const result = applyDecay({
      status: "acquisition",
      progress: 1.0,
      bestStatus: "acquisition",
      lastTrainedAt: day(1),
      now: day(5),
      dog,
      users: [],
    })
    // 4 days between day1 and day5, minus 3 vacation days = 1 active day
    // 1 - 0.15*1 = 0.85
    expect(result.progress).toBeCloseTo(0.85, 5)
  })
})
