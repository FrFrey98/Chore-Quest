import type { SkillStatus, SkillPhase, DogPhase } from "./types"
import { statusRank } from "./status"

export type DailyChallengeSkill = {
  skillDefinitionId: string
  status: SkillStatus
  progress: number
  trainedCount: number
  bestStatus: SkillStatus
  lastTrainedAt: Date | null
  phase: SkillPhase
  prerequisiteIds: string[]
}

export type PickDailyChallengeInput = {
  dogId: string
  dogPhase: DogPhase
  skills: DailyChallengeSkill[]
  today: Date
}

export type DailyChallenge = {
  maintenance: DailyChallengeSkill | null
  progression: DailyChallengeSkill | null
  discovery: DailyChallengeSkill | null
}

function phaseAllowed(skillPhase: SkillPhase, dogPhase: DogPhase): boolean {
  const order: Record<string, number> = {
    puppy: 0,
    adolescent: 1,
    adult: 2,
    senior: 2,
    advanced: 3,
  }
  return order[skillPhase] <= order[dogPhase]
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function pickDailyChallenge(input: PickDailyChallengeInput): DailyChallenge {
  const pool = input.skills.filter((s) => phaseAllowed(s.phase, input.dogPhase))

  // Maintenance: trained skills with bestStatus >= fluency, lowest effective progress
  const maintenanceCandidates = pool.filter(
    (s) => s.trainedCount > 0 && statusRank(s.bestStatus) >= statusRank("fluency"),
  )
  maintenanceCandidates.sort((a, b) => {
    const aScore = statusRank(a.status) + a.progress
    const bScore = statusRank(b.status) + b.progress
    if (aScore !== bScore) return aScore - bScore
    const aTime = a.lastTrainedAt?.getTime() ?? 0
    const bTime = b.lastTrainedAt?.getTime() ?? 0
    return aTime - bTime
  })
  const maintenance = maintenanceCandidates[0] ?? null

  // Progression: trained with status acquisition/fluency, highest progress
  const progressionCandidates = pool.filter(
    (s) =>
      s.trainedCount > 0 &&
      (s.status === "acquisition" || s.status === "fluency") &&
      s.skillDefinitionId !== maintenance?.skillDefinitionId,
  )
  progressionCandidates.sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress
    return a.skillDefinitionId.localeCompare(b.skillDefinitionId)
  })
  const progression = progressionCandidates[0] ?? null

  // Discovery: untrained skills
  const usedIds = new Set(
    [maintenance?.skillDefinitionId, progression?.skillDefinitionId].filter(
      Boolean,
    ) as string[],
  )
  const untrained = pool.filter(
    (s) => s.trainedCount === 0 && !usedIds.has(s.skillDefinitionId),
  )
  const prereqReady = untrained.filter((s) => {
    if (s.prerequisiteIds.length === 0) return true
    return s.prerequisiteIds.every((prereqId) => {
      const prereq = pool.find((p) => p.skillDefinitionId === prereqId)
      return prereq && statusRank(prereq.bestStatus) >= statusRank("fluency")
    })
  })
  const discoveryPool = prereqReady.length > 0 ? prereqReady : untrained

  let discovery: DailyChallengeSkill | null = null
  if (discoveryPool.length > 0) {
    const sorted = [...discoveryPool].sort((a, b) =>
      a.skillDefinitionId.localeCompare(b.skillDefinitionId),
    )
    const seed = hashString(`${input.dogId}-${dateKey(input.today)}`)
    discovery = sorted[seed % sorted.length]
  }

  return { maintenance, progression, discovery }
}
