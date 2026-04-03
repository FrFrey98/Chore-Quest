import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { getTotalEarned, getLevel, getCurrentPoints } from '@/lib/points'
import { computeStats } from '@/lib/achievements'
import { getOrCreateStreakState, getStreakTier, getEffectiveStreak, isRestoreAvailable } from '@/lib/streak'
import { getWeekBounds, groupFeedByDay } from '@/lib/dashboard'
import type { FeedEntry } from '@/lib/dashboard'
import { StatPills } from '@/components/dashboard/stat-pills'
import { TodaySection } from '@/components/dashboard/today-section'
import { WeekChart } from '@/components/dashboard/week-chart'
import { GroupedFeed } from '@/components/dashboard/grouped-feed'
import { DashboardNotifications } from '@/components/dashboard/dashboard-notifications'

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const config = await loadGameConfig()

  const now = new Date()

  // --- Stat Pills Data ---
  const [stats, spent, users] = await Promise.all([
    computeStats(userId, config.levelDefinitions),
    prisma.purchase.aggregate({
      where: { userId },
      _sum: { pointsSpent: true },
    }),
    prisma.user.findMany({
      include: {
        completions: { select: { points: true } },
        userAchievements: { select: { id: true } },
      },
    }),
  ])
  const [streakState, restoreInfo] = await Promise.all([
    getOrCreateStreakState(userId),
    isRestoreAvailable(userId, { basePrice: config.restoreBasePrice, perDayPrice: config.restorePerDayPrice }),
  ])
  const effectiveStreak = getEffectiveStreak(streakState)
  const streakTier = getStreakTier(effectiveStreak, config.streakTiers)

  const levelInfo = getLevel(stats.totalPointsEarned, config.levelDefinitions)
  const balance = getCurrentPoints(stats.totalPointsEarned, spent._sum.pointsSpent ?? 0)
  const me = users.find((u) => u.id === userId)!
  const partner = users.find((u) => u.id !== userId)
  const partnerLevel = partner ? getLevel(getTotalEarned(partner.completions), config.levelDefinitions) : null
  const partnerAchievementCount = partner ? partner.userAchievements.length : 0

  // --- Today Section Data ---
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)

  const [todayCompletions, recurringTasks] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId, completedAt: { gte: todayStart } },
      include: { task: { select: { id: true, emoji: true, title: true, points: true, allowMultiple: true, dailyLimit: true } } },
    }),
    prisma.task.findMany({
      where: {
        status: 'active',
        isRecurring: true,
        OR: [
          { nextDueAt: null },
          { nextDueAt: { lte: now } },
        ],
      },
      select: { id: true, emoji: true, title: true, points: true, allowMultiple: true, dailyLimit: true },
    }),
  ])
  const completedToday = todayCompletions.map((c) => ({
    id: c.id,
    emoji: c.task.emoji,
    title: c.task.title,
    points: c.points,
  }))

  // Count completions per task for multi-completion support
  const completionCountByTask = new Map<string, number>()
  for (const c of todayCompletions) {
    completionCountByTask.set(c.taskId, (completionCountByTask.get(c.taskId) ?? 0) + 1)
  }

  const dueTasks = recurringTasks
    .filter((t) => {
      const count = completionCountByTask.get(t.id) ?? 0
      if (t.allowMultiple && t.dailyLimit) {
        return count < t.dailyLimit
      }
      return count === 0
    })
    .map((t) => ({
      ...t,
      todayCount: completionCountByTask.get(t.id) ?? 0,
    }))

  let suggestions: { id: string; emoji: string; title: string }[] = []
  if (dueTasks.length < 3) {
    const completedEver = await prisma.taskCompletion.findMany({
      where: { userId },
      select: { taskId: true },
      distinct: ['taskId'],
    })
    const completedEverIds = new Set(completedEver.map((c) => c.taskId))

    const candidates = await prisma.task.findMany({
      where: {
        status: 'active',
        isRecurring: false,
      },
      select: { id: true, emoji: true, title: true },
    })
    const eligible = candidates.filter((t) => !completedEverIds.has(t.id))
    const shuffled = eligible.sort(() => Math.random() - 0.5)
    suggestions = shuffled.slice(0, 2)
  }

  // --- Week Chart & Feed Data ---
  const { start: weekStart, end: weekEnd } = getWeekBounds(now)
  const todayDayIndex = now.getUTCDay() === 0 ? 6 : now.getUTCDay() - 1
  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const [weekCompletions, completions, recentRedemptions] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { completedAt: { gte: weekStart, lte: weekEnd } },
      select: { userId: true, completedAt: true },
    }),
    prisma.taskCompletion.findMany({
      take: 30,
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { title: true, emoji: true } },
        withUser: { select: { id: true, name: true } },
      },
    }),
    prisma.purchase.findMany({
      where: { redeemedAt: { not: null, gte: twoWeeksAgo } },
      orderBy: { redeemedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        item: { select: { title: true, emoji: true } },
      },
    }),
  ])

  const weekDays = DAY_LABELS.map((day, i) => {
    const dayDate = new Date(weekStart)
    dayDate.setUTCDate(dayDate.getUTCDate() + i)
    const dayKey = dayDate.toISOString().slice(0, 10)

    const dayCompletions = weekCompletions.filter(
      (c) => c.completedAt.toISOString().slice(0, 10) === dayKey
    )

    return {
      day,
      userCount: dayCompletions.filter((c) => c.userId === userId).length,
      partnerCount: partner ? dayCompletions.filter((c) => c.userId === partner.id).length : 0,
      isFuture: i > todayDayIndex,
    }
  })

  const feedEntries: FeedEntry[] = [
    ...completions.map((c) => ({
      id: c.id,
      type: 'completion' as const,
      user: { id: c.user.id, name: c.user.name ?? 'Unbekannt' },
      task: c.task,
      points: c.points,
      at: c.completedAt.toISOString(),
      withUser: c.withUser ? { id: c.withUser.id, name: c.withUser.name ?? 'Unbekannt' } : null,
    })),
    ...recentRedemptions.map((p) => ({
      id: p.id,
      type: 'redemption' as const,
      user: { id: p.user.id, name: p.user.name ?? 'Unbekannt' },
      item: p.item,
      points: 0,
      at: p.redeemedAt!.toISOString(),
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  // Deduplicate shared completions: keep only one entry per shared pair
  const seenSharedPairs = new Set<string>()
  const dedupedFeed = feedEntries.filter((entry) => {
    if (entry.type !== 'completion' || !entry.withUser) return true
    const pairKey = [entry.user.id, entry.withUser.id].sort().join('-') + '-' + (entry.task?.title ?? '') + '-' + entry.at.slice(0, 16)
    if (seenSharedPairs.has(pairKey)) return false
    seenSharedPairs.add(pairKey)
    return true
  })

  const feedGroups = groupFeedByDay(dedupedFeed, now)

  return (
    <div>
      <DashboardNotifications />
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <StatPills
        streakDays={effectiveStreak}
        streakBonusPercent={streakTier.percent}
        streakBonusName={streakTier.name}
        restoreAvailable={restoreInfo.available}
        restorePrice={restoreInfo.price}
        level={levelInfo.level}
        levelTitle={levelInfo.title}
        totalEarned={stats.totalPointsEarned}
        balance={balance}
        levelDefinitions={config.levelDefinitions}
      />

      {partner && partnerLevel && (
        <Link href={`/profile/${partner.id}`}>
          <div className="mb-4 p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="text-2xl">👫</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{partner.name ?? 'Unbekannt'}</p>
              <p className="text-xs text-slate-500">{partnerLevel.title} · {partnerAchievementCount} Erfolge</p>
            </div>
            <span className="text-slate-400 text-sm">›</span>
          </div>
        </Link>
      )}

      <TodaySection
        completed={completedToday}
        due={dueTasks}
        suggestions={suggestions}
        partnerId={partner?.id}
        partnerName={partner?.name ?? 'Partner'}
      />

      <WeekChart
        days={weekDays}
        userName={me.name ?? 'Ich'}
        partnerName={partner?.name ?? 'Partner'}
      />

      <div className="flex justify-end -mt-2 mb-4">
        <Link href="/stats" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
          Alle Statistiken →
        </Link>
      </div>

      <GroupedFeed groups={feedGroups} currentUserId={userId} />
    </div>
  )
}
