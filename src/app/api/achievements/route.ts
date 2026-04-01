import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeStats } from '@/lib/achievements'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userIdParam = new URL(req.url).searchParams.get('userId')
  const userId = userIdParam ?? session.user.id

  const allAchievements = await prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } })
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, unlockedAt: true },
  })

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]))
  const stats = await computeStats(userId)

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
  return NextResponse.json({ achievements, totalUnlocked, total: achievements.length })
}
