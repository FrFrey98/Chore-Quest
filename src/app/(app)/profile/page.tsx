import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  // --- Personal stats (from old stats page) ---
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    include: { task: { select: { title: true, emoji: true, categoryId: true } } },
    orderBy: { completedAt: 'asc' },
  })

  const categories = await prisma.category.findMany()

  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  const taskCount: Record<string, { count: number; title: string; emoji: string }> = {}
  for (const c of completions) {
    if (!taskCount[c.taskId])
      taskCount[c.taskId] = { count: 0, title: c.task.title, emoji: c.task.emoji }
    taskCount[c.taskId].count++
  }
  const topTasks = Object.values(taskCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const daySet = new Set(completions.map((c) => c.completedAt.toISOString().slice(0, 10)))
  let streak = 0
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const startDay = daySet.has(todayKey) ? 0 : 1
  for (let i = startDay; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    if (daySet.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  const totalEarned = getTotalEarned(completions)
  const level = getLevel(totalEarned)

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

  // --- Admin data (from old admin page) ---
  const storeItems = await prisma.storeItem.findMany({
    where: { type: 'real_reward' },
    orderBy: { createdAt: 'desc' },
  })

  const tasks = await prisma.task.findMany({
    where: { status: { in: ['active', 'pending_approval'] } },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const userName = session.user.name ?? 'Profil'

  return (
    <ProfileClient
      userName={userName}
      personal={{
        heatmap,
        topTasks,
        streak,
        totalCompletions: completions.length,
        totalPointsEarned: totalEarned,
        level,
        purchases: purchasesForClient,
      }}
      categories={categories}
      achievementsSummary={achievementsSummary}
      isOwnProfile={true}
      storeItems={storeItems}
      tasks={tasks}
      userId={userId}
    />
  )
}
