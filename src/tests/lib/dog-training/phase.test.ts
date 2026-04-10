import { describe, it, expect } from "vitest"
import { suggestPhase } from "@/lib/dog-training/phase"

const birthDaysAgo = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

describe("suggestPhase", () => {
  it("returns puppy when < 4 months", () => {
    expect(suggestPhase(birthDaysAgo(30))).toBe("puppy")
  })

  it("returns adolescent for 4-12 months", () => {
    expect(suggestPhase(birthDaysAgo(180))).toBe("adolescent")
  })

  it("returns adult for 1-7 years", () => {
    expect(suggestPhase(birthDaysAgo(365 * 3))).toBe("adult")
  })

  it("returns senior for > 7 years", () => {
    expect(suggestPhase(birthDaysAgo(365 * 8))).toBe("senior")
  })

  it("returns adult when birthDate is null", () => {
    expect(suggestPhase(null)).toBe("adult")
  })
})
