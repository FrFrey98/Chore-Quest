import { describe, it, expect } from "vitest"
import { evaluateAchievementCondition } from "@/lib/dog-training/achievements"

describe("evaluateAchievementCondition", () => {
  const ctx = {
    sessionCount: 10,
    teamSessionCount: 3,
    trainingStreakDays: 7,
    skillStatusCounts: {
      new: 0,
      acquisition: 5,
      fluency: 8,
      proficiency: 2,
      maintenance: 1,
      mastery: 0,
    },
    pillarHealth: {
      basic_obedience: 60,
      impulse_control: 40,
      recall: 30,
      leash: 20,
      socialization: 55,
      tricks: 35,
      scent_work: 10,
    },
  }

  it("matches session_count when count ≥ value", () => {
    expect(
      evaluateAchievementCondition(
        { conditionType: "session_count", conditionValue: 10, conditionMeta: null },
        ctx,
      ),
    ).toBe(true)
    expect(
      evaluateAchievementCondition(
        { conditionType: "session_count", conditionValue: 20, conditionMeta: null },
        ctx,
      ),
    ).toBe(false)
  })

  it("matches skill_status with status filter in meta", () => {
    // 8 + 2 + 1 + 0 = 11 skills at ≥fluency
    expect(
      evaluateAchievementCondition(
        { conditionType: "skill_status", conditionValue: 10, conditionMeta: "fluency" },
        ctx,
      ),
    ).toBe(true)
    expect(
      evaluateAchievementCondition(
        { conditionType: "skill_status", conditionValue: 20, conditionMeta: "fluency" },
        ctx,
      ),
    ).toBe(false)
  })

  it("matches pillar_health", () => {
    expect(
      evaluateAchievementCondition(
        {
          conditionType: "pillar_health",
          conditionValue: 50,
          conditionMeta: "basic_obedience",
        },
        ctx,
      ),
    ).toBe(true)
    expect(
      evaluateAchievementCondition(
        {
          conditionType: "pillar_health",
          conditionValue: 50,
          conditionMeta: "recall",
        },
        ctx,
      ),
    ).toBe(false)
  })

  it("matches training_streak_days", () => {
    expect(
      evaluateAchievementCondition(
        { conditionType: "training_streak_days", conditionValue: 7, conditionMeta: null },
        ctx,
      ),
    ).toBe(true)
    expect(
      evaluateAchievementCondition(
        { conditionType: "training_streak_days", conditionValue: 30, conditionMeta: null },
        ctx,
      ),
    ).toBe(false)
  })

  it("matches team_session_count", () => {
    expect(
      evaluateAchievementCondition(
        { conditionType: "team_session_count", conditionValue: 3, conditionMeta: null },
        ctx,
      ),
    ).toBe(true)
    expect(
      evaluateAchievementCondition(
        { conditionType: "team_session_count", conditionValue: 10, conditionMeta: null },
        ctx,
      ),
    ).toBe(false)
  })
})
