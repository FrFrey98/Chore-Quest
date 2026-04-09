import { SKILL_STATUSES, type SkillStatus } from "./types"
import { STATUS_PROGRESS_RANK } from "./constants"

export function statusRank(status: SkillStatus): number {
  return STATUS_PROGRESS_RANK[status]
}

export function nextStatus(status: SkillStatus): SkillStatus | null {
  const index = SKILL_STATUSES.indexOf(status)
  if (index === -1 || index >= SKILL_STATUSES.length - 1) return null
  return SKILL_STATUSES[index + 1]
}

export function previousStatus(status: SkillStatus): SkillStatus | null {
  const index = SKILL_STATUSES.indexOf(status)
  if (index <= 0) return null
  return SKILL_STATUSES[index - 1]
}

export function compareStatus(a: SkillStatus, b: SkillStatus): number {
  return statusRank(a) - statusRank(b)
}

export function isHigherStatus(a: SkillStatus, b: SkillStatus): boolean {
  return statusRank(a) > statusRank(b)
}

export function maxStatus(a: SkillStatus, b: SkillStatus): SkillStatus {
  return isHigherStatus(a, b) ? a : b
}
