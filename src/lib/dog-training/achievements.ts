import type { SkillStatus } from "./types"
import { SKILL_STATUSES } from "./types"
import { statusRank } from "./status"

export type AchievementCondition = {
  conditionType: string
  conditionValue: number
  conditionMeta: string | null
}

export type AchievementContext = {
  sessionCount: number
  teamSessionCount: number
  trainingStreakDays: number
  skillStatusCounts: Record<SkillStatus, number>
  pillarHealth: Record<string, number>
}

function countAtOrAbove(
  counts: Record<SkillStatus, number>,
  minStatus: SkillStatus,
): number {
  const minRank = statusRank(minStatus)
  return SKILL_STATUSES.filter((s) => statusRank(s) >= minRank).reduce(
    (sum, s) => sum + (counts[s] ?? 0),
    0,
  )
}

export function evaluateAchievementCondition(
  cond: AchievementCondition,
  ctx: AchievementContext,
): boolean {
  switch (cond.conditionType) {
    case "session_count":
      return ctx.sessionCount >= cond.conditionValue
    case "team_session_count":
      return ctx.teamSessionCount >= cond.conditionValue
    case "training_streak_days":
      return ctx.trainingStreakDays >= cond.conditionValue
    case "skill_status": {
      const minStatus = (cond.conditionMeta ?? "fluency") as SkillStatus
      return countAtOrAbove(ctx.skillStatusCounts, minStatus) >= cond.conditionValue
    }
    case "pillar_health": {
      const pillarId = cond.conditionMeta ?? ""
      const health = ctx.pillarHealth[pillarId] ?? 0
      return health >= cond.conditionValue
    }
    default:
      return false
  }
}
