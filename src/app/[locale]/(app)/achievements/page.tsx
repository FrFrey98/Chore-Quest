import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeStats } from '@/lib/achievements'
import { AchievementsClient } from './achievements-client'
import { loadGameConfig } from '@/lib/config'

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const config = await loadGameConfig()

  const allAchievements = await prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } })
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    select: { achievementId: true, unlockedAt: true },
  })

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]))
  const stats = await computeStats(session.user.id, config.levelDefinitions)

  const achievements = allAchievements.map((a) => {
    const unlocked = unlockedMap.has(a.id)
    const unlockedAt = unlockedMap.get(a.id)?.toISOString() ?? null

    let progress = 0
    const progressMax = a.conditionValue
    switch (a.conditionType) {
      case 'task_count': progress = stats.totalTaskCount; break
      case 'category_count': progress = stats.categoryCounts[a.conditionMeta ?? ''] ?? 0; break
      case 'streak_days': progress = stats.currentStreakDays; break
      case 'total_points': progress = stats.totalPointsEarned; break
      case 'level': progress = stats.currentLevel; break
    }

    return {
      id: a.id, title: a.title, description: a.description, emoji: a.emoji,
      conditionType: a.conditionType, unlocked, unlockedAt,
      progress: Math.min(progress, progressMax), progressMax,
    }
  })

  const totalUnlocked = achievements.filter((a) => a.unlocked).length

  return (
    <AchievementsClient
      achievements={achievements}
      totalUnlocked={totalUnlocked}
      total={achievements.length}
    />
  )
}
