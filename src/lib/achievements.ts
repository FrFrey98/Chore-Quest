import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'
import { getOrCreateStreakState, getEffectiveStreak } from '@/lib/streak'
import { type LevelDef } from '@/lib/config'

export type AchievementStats = {
  totalTaskCount: number
  categoryCounts: Record<string, number>
  currentStreakDays: number
  totalPointsEarned: number
  currentLevel: number
}

export function checkAchievementCondition(
  conditionType: string,
  conditionValue: number,
  conditionMeta: string | null,
  stats: AchievementStats
): boolean {
  switch (conditionType) {
    case 'task_count':
      return stats.totalTaskCount >= conditionValue
    case 'category_count':
      return (stats.categoryCounts[conditionMeta ?? ''] ?? 0) >= conditionValue
    case 'streak_days':
      return stats.currentStreakDays >= conditionValue
    case 'total_points':
      return stats.totalPointsEarned >= conditionValue
    case 'level':
      return stats.currentLevel >= conditionValue
    default:
      return false
  }
}

export async function computeStats(userId: string, levels?: LevelDef[]): Promise<AchievementStats> {
  const [completions, streakState] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      include: { task: { select: { categoryId: true } } },
      orderBy: { completedAt: 'asc' },
    }),
    getOrCreateStreakState(userId),
  ])

  const totalTaskCount = completions.length
  const totalPointsEarned = getTotalEarned(completions)
  const currentLevel = getLevel(totalPointsEarned, levels).level

  const categoryCounts: Record<string, number> = {}
  for (const c of completions) {
    const catId = c.task.categoryId
    categoryCounts[catId] = (categoryCounts[catId] ?? 0) + 1
  }

  return {
    totalTaskCount,
    categoryCounts,
    currentStreakDays: getEffectiveStreak(streakState),
    totalPointsEarned,
    currentLevel,
  }
}

export async function checkAndUnlockAchievements(userId: string, levels?: LevelDef[]): Promise<string[]> {
  const stats = await computeStats(userId, levels)

  const allAchievements = await prisma.achievement.findMany()
  const existing = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const existingIds = new Set(existing.map((e) => e.achievementId))

  const toUnlock = allAchievements.filter(
    (a) => !existingIds.has(a.id) && checkAchievementCondition(a.conditionType, a.conditionValue, a.conditionMeta, stats)
  )

  if (toUnlock.length > 0) {
    await prisma.userAchievement.createMany({
      data: toUnlock.map((a) => ({ userId, achievementId: a.id })),
    })
  }

  return toUnlock.map((a) => a.id)
}
