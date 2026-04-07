import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from '../profile-client'
import { computeProfileStats } from '@/lib/profile-stats'
import { loadGameConfig } from '@/lib/config'

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: userIdParam } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const config = await loadGameConfig()

  const targetUser = await prisma.user.findUnique({ where: { id: userIdParam } })
  if (!targetUser) redirect('/profile')

  const userId = targetUser.id

  const stats = await computeProfileStats(userId, config.levelDefinitions)

  // --- Achievements summary ---
  const allAchievements = await prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } })
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId))

  const achievementsSummary = {
    total: allAchievements.length,
    unlocked: unlockedIds.size,
    previews: allAchievements.slice(0, 8).map((a) => ({
      id: a.id,
      emoji: a.emoji,
      unlocked: unlockedIds.has(a.id),
    })),
  }

  const t = await getTranslations('profile')
  const userName = targetUser.name ?? t('heading')

  return (
    <ProfileClient
      userName={userName}
      userId={userId}
      personal={{
        heatmap: stats.heatmap,
        topTasks: stats.topTasks,
        streak: stats.streak,
        totalCompletions: stats.completionCount,
        totalPointsEarned: stats.totalEarned,
        level: stats.level,
        purchases: [],
      }}
      achievementsSummary={achievementsSummary}
      isOwnProfile={false}
    />
  )
}
