import { describe, it, expect } from "vitest"
import { pickDailyChallenge } from "@/lib/dog-training/daily-challenge"

const day = (n: number) => new Date(2026, 0, n, 12, 0, 0)

const skill = (
  id: string,
  overrides: {
    status?: "new" | "acquisition" | "fluency" | "proficiency" | "maintenance" | "mastery"
    progress?: number
    trainedCount?: number
    bestStatus?: "new" | "acquisition" | "fluency" | "proficiency" | "maintenance" | "mastery"
    lastTrainedAt?: Date | null
    phase?: "puppy" | "adolescent" | "adult" | "advanced"
    prerequisiteIds?: string[]
  } = {},
) => ({
  skillDefinitionId: id,
  status: overrides.status ?? "new",
  progress: overrides.progress ?? 0,
  trainedCount: overrides.trainedCount ?? 0,
  bestStatus: overrides.bestStatus ?? "new",
  lastTrainedAt: overrides.lastTrainedAt ?? null,
  phase: overrides.phase ?? "adult",
  prerequisiteIds: overrides.prerequisiteIds ?? [],
})

describe("pickDailyChallenge", () => {
  it("returns discovery-only when no trained skills", () => {
    const result = pickDailyChallenge({
      dogId: "d1",
      dogPhase: "adult",
      skills: [skill("sit"), skill("down"), skill("come")],
      today: day(5),
    })
    expect(result.discovery).toBeTruthy()
    expect(result.maintenance).toBeNull()
    expect(result.progression).toBeNull()
  })

  it("picks maintenance slot from decayed trained skills with bestStatus >= fluency", () => {
    const result = pickDailyChallenge({
      dogId: "d1",
      dogPhase: "adult",
      skills: [
        skill("sit", { status: "fluency", progress: 0.2, trainedCount: 6, bestStatus: "fluency", lastTrainedAt: day(1) }),
        skill("down", { status: "acquisition", progress: 0.6, trainedCount: 2, bestStatus: "acquisition", lastTrainedAt: day(3) }),
        skill("come"),
      ],
      today: day(5),
    })
    expect(result.maintenance?.skillDefinitionId).toBe("sit")
  })

  it("picks progression slot with highest progress in acquisition/fluency", () => {
    const result = pickDailyChallenge({
      dogId: "d1",
      dogPhase: "adult",
      skills: [
        skill("sit", { status: "acquisition", progress: 0.9, trainedCount: 3, lastTrainedAt: day(1) }),
        skill("down", { status: "acquisition", progress: 0.4, trainedCount: 2, lastTrainedAt: day(1) }),
        skill("come"),
      ],
      today: day(5),
    })
    expect(result.progression?.skillDefinitionId).toBe("sit")
  })

  it("discovery slot is deterministic for same day", () => {
    const skills = [
      skill("a"),
      skill("b"),
      skill("c"),
      skill("d"),
      skill("e"),
    ]
    const a = pickDailyChallenge({ dogId: "d1", dogPhase: "adult", skills, today: day(5) })
    const b = pickDailyChallenge({ dogId: "d1", dogPhase: "adult", skills, today: day(5) })
    expect(a.discovery?.skillDefinitionId).toBe(b.discovery?.skillDefinitionId)
  })

  it("returns 3 distinct skills when enough candidates exist", () => {
    const result = pickDailyChallenge({
      dogId: "d1",
      dogPhase: "adult",
      skills: [
        skill("sit", { status: "fluency", progress: 0.5, trainedCount: 6, bestStatus: "fluency", lastTrainedAt: day(1) }),
        skill("down", { status: "acquisition", progress: 0.7, trainedCount: 3, lastTrainedAt: day(2) }),
        skill("come"),
        skill("paw"),
      ],
      today: day(5),
    })
    const ids = [result.maintenance?.skillDefinitionId, result.progression?.skillDefinitionId, result.discovery?.skillDefinitionId].filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
