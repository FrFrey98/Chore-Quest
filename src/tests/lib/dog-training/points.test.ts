import { describe, it, expect } from "vitest"
import { calculateSessionPoints } from "@/lib/dog-training/points"

describe("calculateSessionPoints", () => {
  it("calculates base + skill bonus + quality for a standard session", () => {
    const result = calculateSessionPoints({
      durationMinutes: 15,
      skills: [
        { skillDefinitionId: "sit", rating: "good" },
        { skillDefinitionId: "down", rating: "good" },
        { skillDefinitionId: "paw", rating: "good" },
      ],
      recommendedSkillIds: ["sit", "down", "paw"],
      pointsEarnedTodayForDog: 0,
    })
    // base = 15*0.5 = 7.5
    // skillBonus = 3*3 = 9
    // qualityBonus = 3 * 2 = 6
    // subtotal = 22.5
    // multiplier 3 matches = 1.5
    // raw = 33.75 → 34
    expect(result.points).toBe(34)
    expect(result.challengeMatches).toBe(3)
  })

  it("applies daily cap", () => {
    const result = calculateSessionPoints({
      durationMinutes: 30,
      skills: [
        { skillDefinitionId: "sit", rating: "good" },
        { skillDefinitionId: "down", rating: "good" },
        { skillDefinitionId: "paw", rating: "good" },
        { skillDefinitionId: "spin", rating: "good" },
      ],
      recommendedSkillIds: ["sit"],
      pointsEarnedTodayForDog: 20,
    })
    expect(result.points).toBeLessThanOrEqual(20)
    expect(result.points).toBe(20)
  })

  it("returns zero when cap is already reached", () => {
    const result = calculateSessionPoints({
      durationMinutes: 15,
      skills: [{ skillDefinitionId: "sit", rating: "good" }],
      recommendedSkillIds: [],
      pointsEarnedTodayForDog: 40,
    })
    expect(result.points).toBe(0)
  })

  it("applies no multiplier when no challenge matches", () => {
    const result = calculateSessionPoints({
      durationMinutes: 10,
      skills: [{ skillDefinitionId: "spin", rating: "okay" }],
      recommendedSkillIds: ["sit", "down", "paw"],
      pointsEarnedTodayForDog: 0,
    })
    // base 5 + skill 3 + quality 1 = 9
    expect(result.points).toBe(9)
    expect(result.challengeMatches).toBe(0)
  })

  it("handles poor rating correctly", () => {
    const result = calculateSessionPoints({
      durationMinutes: 10,
      skills: [{ skillDefinitionId: "sit", rating: "poor" }],
      recommendedSkillIds: [],
      pointsEarnedTodayForDog: 0,
    })
    // base 5 + skill 3 + quality 0 = 8
    expect(result.points).toBe(8)
  })
})
