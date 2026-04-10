import type { SkillStatus, TrainingRating } from "./types"
import { RATING_BOOSTS, STATUS_REQUIREMENTS } from "./constants"
import { nextStatus, maxStatus } from "./status"

export type ApplyBoostInput = {
  status: SkillStatus
  progress: number
  bestStatus: SkillStatus
  trainedCount: number
  firstTrainedAt: Date | null
  rating: TrainingRating
  now: Date
}

export type ApplyBoostResult = {
  status: SkillStatus
  progress: number
  bestStatus: SkillStatus
  trainedCount: number
  firstTrainedAt: Date
  lastTrainedAt: Date
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY)
}

function canPromote(
  targetStatus: SkillStatus,
  trainedCount: number,
  firstTrainedAt: Date,
  now: Date,
): boolean {
  if (targetStatus === "new") return false
  const req = STATUS_REQUIREMENTS[targetStatus as Exclude<SkillStatus, "new">]
  if (!req) return false
  if (trainedCount < req.minSessions) return false
  if (daysBetween(firstTrainedAt, now) < req.minDays) return false
  return true
}

export function applyTrainingBoost(input: ApplyBoostInput): ApplyBoostResult {
  const boost = RATING_BOOSTS[input.rating]
  const newTrainedCount = input.trainedCount + 1
  const newFirstTrainedAt = input.firstTrainedAt ?? input.now
  let status = input.status
  let progress = input.progress
  let bestStatus = input.bestStatus

  // Transition new -> acquisition immediately on first boost
  if (status === "new") {
    status = "acquisition"
    progress = 0
  }

  progress = Math.min(1.0, progress + boost)

  // Promotion loop (may promote multiple stages in theory, though unlikely)
  while (progress >= 1.0) {
    const target = nextStatus(status)
    if (!target) {
      progress = 1.0
      break
    }
    if (!canPromote(target, newTrainedCount, newFirstTrainedAt, input.now)) {
      progress = 1.0
      break
    }
    status = target
    progress = 0
  }

  bestStatus = maxStatus(bestStatus, status)

  return {
    status,
    progress,
    bestStatus,
    trainedCount: newTrainedCount,
    firstTrainedAt: newFirstTrainedAt,
    lastTrainedAt: input.now,
  }
}
