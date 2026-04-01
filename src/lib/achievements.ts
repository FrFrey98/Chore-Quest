import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'

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

export async function computeStats(userId: string): Promise<AchievementStats> {
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    include: { task: { select: { categoryId: true } } },
    orderBy: { completedAt: 'asc' },
  })

  const totalTaskCount = completions.length
  const totalPointsEarned = getTotalEarned(completions)
  const currentLevel = getLevel(totalPointsEarned).level

  const categoryCounts: Record<string, number> = {}
  for (const c of completions) {
    const catId = c.task.categoryId
    categoryCounts[catId] = (categoryCounts[catId] ?? 0) + 1
  }

  // Calculate streak
  const daySet = new Set(completions.map((c) => c.completedAt.toISOString().slice(0, 10)))
  let currentStreakDays = 0
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const startDay = daySet.has(todayKey) ? 0 : 1
  for (let i = startDay; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    if (daySet.has(d.toISOString().slice(0, 10))) currentStreakDays++
    else break
  }

  return { totalTaskCount, categoryCounts, currentStreakDays, totalPointsEarned, currentLevel }
}

export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const stats = await computeStats(userId)

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
