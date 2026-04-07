import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { ProfileClient } from './profile-client'
import { computeProfileStats } from '@/lib/profile-stats'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id
  const config = await loadGameConfig()

  // --- Personal stats (from old stats page) ---
  const stats = await computeProfileStats(userId, config.levelDefinitions)

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { item: { select: { title: true, emoji: true, type: true } } },
    orderBy: { purchasedAt: 'desc' },
  })

  const purchasesForClient = purchases.map((p) => ({
    id: p.id,
    purchasedAt: p.purchasedAt.toISOString(),
    redeemedAt: p.redeemedAt?.toISOString() ?? null,
    pointsSpent: p.pointsSpent,
    item: p.item,
  }))

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

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { vacationStart: true, vacationEnd: true },
  })

  const t = await getTranslations('profile')
  const userName = session.user.name ?? t('heading')

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
        purchases: purchasesForClient,
      }}
      achievementsSummary={achievementsSummary}
      isOwnProfile={true}
      vacationStart={userRecord?.vacationStart?.toISOString() ?? null}
      vacationEnd={userRecord?.vacationEnd?.toISOString() ?? null}
    />
  )
}
