import { describe, it, expect } from "vitest"
import { calculateStreak } from "@/lib/dog-training/streak"

function day(offset: number): Date {
  const d = new Date("2026-04-10T12:00:00Z")
  d.setDate(d.getDate() + offset)
  return d
}

describe("calculateStreak", () => {
  it("returns 0 when no sessions", () => {
    expect(calculateStreak([], day(0))).toBe(0)
  })

  it("returns 1 when only today has a session", () => {
    expect(calculateStreak([day(0)], day(0))).toBe(1)
  })

  it("returns streak of consecutive days", () => {
    expect(calculateStreak([day(0), day(-1), day(-2)], day(0))).toBe(3)
  })

  it("breaks streak on gap day", () => {
    expect(calculateStreak([day(0), day(-1), day(-3)], day(0))).toBe(2)
  })

  it("counts yesterday streak when no session today", () => {
    expect(calculateStreak([day(-1), day(-2), day(-3)], day(0))).toBe(3)
  })

  it("handles multiple sessions per day", () => {
    const morning = new Date("2026-04-10T08:00:00Z")
    const evening = new Date("2026-04-10T18:00:00Z")
    const yesterday = new Date("2026-04-09T10:00:00Z")
    expect(calculateStreak([morning, evening, yesterday], day(0))).toBe(2)
  })

  it("returns 0 when last session was 2+ days ago", () => {
    expect(calculateStreak([day(-3)], day(0))).toBe(0)
  })
})
