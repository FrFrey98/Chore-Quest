import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { getTotalEarned, getLevel, getCurrentPoints } from '@/lib/points'
import { computeStats } from '@/lib/achievements'
import { getOrCreateStreakState, getStreakTier, getEffectiveStreak, isRestoreAvailable } from '@/lib/streak'
import { getWeekBounds, groupFeedByDay } from '@/lib/dashboard'
import { isOnVacation } from '@/lib/vacation'
import type { FeedEntry } from '@/lib/dashboard'
import { StatPills } from '@/components/dashboard/stat-pills'
import { TodaySection } from '@/components/dashboard/today-section'
import { WeekChart } from '@/components/dashboard/week-chart'
import { GroupedFeed } from '@/components/dashboard/grouped-feed'
import { DashboardNotifications } from '@/components/dashboard/dashboard-notifications'
import { YesterdayBanner } from '@/components/dashboard/yesterday-banner'
import { ChallengesWidget } from '@/components/dashboard/challenges-widget'
import { QuestsWidget } from '@/components/dashboard/quests-widget'
import { getDailyChallenge } from '@/app/actions/dog-training/get-daily-challenge'
import type { DogTrainingContext } from '@/components/dashboard/today-section'

const WEEKDAY_KEYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'] as const

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const config = await loadGameConfig()
  const t = await getTranslations('dashboard')
  const tc = await getTranslations('common')
  const tw = await getTranslations('weekdays')
  const tv = await getTranslations('vacation')

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
  const [streakState, restoreInfo, userRecord] = await Promise.all([
    getOrCreateStreakState(userId),
    isRestoreAvailable(userId, { basePrice: config.restoreBasePrice, perDayPrice: config.restorePerDayPrice }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { vacationStart: true, vacationEnd: true },
    }),
  ])
  const vacationStart = userRecord?.vacationStart?.toISOString() ?? null
  const vacationEnd = userRecord?.vacationEnd?.toISOString() ?? null
  const effectiveStreak = getEffectiveStreak(streakState, {
    vacationStart: userRecord?.vacationStart,
    vacationEnd: userRecord?.vacationEnd,
  })
  const streakTier = getStreakTier(effectiveStreak, config.streakTiers)

  const levelInfo = getLevel(stats.totalPointsEarned, config.levelDefinitions)
  const balance = getCurrentPoints(stats.totalPointsEarned, spent._sum.pointsSpent ?? 0)
  const me = users.find((u) => u.id === userId)!
  const partner = users.find((u) => u.id !== userId)
  const partnerLevel = partner ? getLevel(getTotalEarned(partner.completions), config.levelDefinitions) : null
  const partnerAchievementCount = partner ? partner.userAchievements.length : 0
  const userOnVacation = isOnVacation(userRecord?.vacationStart, userRecord?.vacationEnd)
  const partnerOnVacation = partner ? isOnVacation(partner.vacationStart, partner.vacationEnd) : false

  // --- Challenges Widget Data ---
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      challenge: {
        weekStart: { lte: now },
        weekEnd: { gte: now },
      },
    },
    include: { challenge: true },
    orderBy: { challenge: { createdAt: 'asc' } },
  })
  const challengesForWidget = userChallenges.map((uc) => ({
    id: uc.id,
    currentProgress: uc.currentProgress,
    completedAt: uc.completedAt?.toISOString() ?? null,
    challenge: {
      id: uc.challenge.id,
      emoji: uc.challenge.emoji,
      title: uc.challenge.title,
      titleDe: uc.challenge.titleDe,
      targetValue: uc.challenge.targetValue,
      bonusPoints: uc.challenge.bonusPoints,
    },
  }))

  // --- Quests Widget Data ---
  const activeUserQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      completedAt: null,
      quest: { isActive: true },
    },
    include: {
      quest: {
        include: {
          steps: {
            include: { task: { select: { title: true, emoji: true } } },
            orderBy: { stepOrder: 'asc' },
          },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  })
  const questsForWidget = activeUserQuests.map((uq) => {
    const currentStep = uq.quest.steps.find((s) => s.stepOrder === uq.currentStepOrder)
    return {
      id: uq.id,
      title: uq.quest.title,
      titleDe: uq.quest.titleDe,
      emoji: uq.quest.emoji,
      currentStepOrder: uq.currentStepOrder,
      totalSteps: uq.quest.steps.length,
      currentStepTaskName: currentStep
        ? `${currentStep.task.emoji} ${currentStep.task.title}`
        : '',
    }
  })

  // --- Today Section Data ---
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)

  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1)

  const [todayCompletions, recurringTasks, yesterdayCompletions] = await Promise.all([
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
      select: { id: true, emoji: true, title: true, points: true, allowMultiple: true, dailyLimit: true, nextDueAt: true, decayHours: true, recurringInterval: true, categoryId: true, isSystem: true },
    }),
    prisma.taskCompletion.findMany({
      where: { userId, completedAt: { gte: yesterdayStart, lt: todayStart } },
      select: { taskId: true },
    }),
  ])
  // Count tasks that were due yesterday but not completed
  const yesterdayCompletedTaskIds = new Set(yesterdayCompletions.map((c) => c.taskId))
  const yesterdayUncompletedCount = recurringTasks.filter((t) => {
    if (yesterdayCompletedTaskIds.has(t.id)) return false
    return true
  }).length

  const completedToday = todayCompletions.map((c) => ({
    id: c.id,
    taskId: c.taskId,
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
      nextDueAt: t.nextDueAt?.toISOString() ?? null,
      todayCount: completionCountByTask.get(t.id) ?? 0,
    }))

  // --- Dog Training Context ---
  const dogTrainingCfg = await prisma.appConfig.findUnique({ where: { key: 'dog_training_enabled' } })
  const dogTrainingEnabled = dogTrainingCfg?.value === 'true'

  let dogTrainingContext: DogTrainingContext | null = null
  if (dogTrainingEnabled) {
    const [dogs, allSkillsRaw, householdUsers] = await Promise.all([
      prisma.dog.findMany({
        where: { archivedAt: null },
        select: { id: true, name: true },
      }),
      prisma.dogSkillDefinition.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { category: { select: { nameDe: true } } },
      }),
      prisma.user.findMany({ select: { id: true, name: true } }),
    ])
    const allSkills = allSkillsRaw.map((s) => ({
      id: s.id,
      nameDe: s.nameDe,
      nameEn: s.nameEn,
      categoryId: s.categoryId,
      categoryNameDe: s.category.nameDe,
    }))
    const dailyChallengesByDogId: Record<string, { maintenance: any; progression: any; discovery: any } | null> = {}
    for (const dog of dogs) {
      dailyChallengesByDogId[dog.id] = await getDailyChallenge(dog.id)
    }
    dogTrainingContext = { dogs, allSkills, householdUsers, dailyChallengesByDogId }
  }

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

  const DAY_LABELS = WEEKDAY_KEYS.map((k) => tw(k))
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
      user: { id: c.user.id, name: c.user.name ?? tc('unknown') },
      task: c.task,
      points: c.points,
      at: c.completedAt.toISOString(),
      withUser: c.withUser ? { id: c.withUser.id, name: c.withUser.name ?? tc('unknown') } : null,
    })),
    ...recentRedemptions.map((p) => ({
      id: p.id,
      type: 'redemption' as const,
      user: { id: p.user.id, name: p.user.name ?? tc('unknown') },
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
      <YesterdayBanner count={yesterdayUncompletedCount} />
      <h1 className="text-[1.75rem] font-light uppercase tracking-wide leading-tight mb-4">{t('heading')}</h1>

      {userOnVacation && (
        <div className="mb-4 p-3 bg-warning-muted border border-warning/20 rounded-xl flex items-center gap-2">
          <span>🏖️</span>
          <span className="text-sm font-medium text-warning">
            {vacationEnd
              ? tv('activeUntil', { date: new Date(vacationEnd).toLocaleDateString() })
              : tv('active')}
          </span>
        </div>
      )}

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

      <ChallengesWidget challenges={challengesForWidget} />
      <QuestsWidget quests={questsForWidget} />

      {partner && partnerLevel && (
        <Link href={`/profile/${partner.id}`}>
          <div className="mb-4 p-3 bg-card rounded-xl border border-border flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="text-2xl">👫</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{partner.name ?? tc('unknown')}</p>
              <p className="text-xs text-muted-foreground">{partnerLevel.title} · {partnerAchievementCount} {t('achievements')}</p>
              {partnerOnVacation && (
                <p className="text-xs text-warning">
                  🏖️ {partner.vacationEnd
                    ? tv('partnerOnVacationUntil', { name: partner.name ?? tc('unknown'), date: new Date(partner.vacationEnd).toLocaleDateString() })
                    : tv('partnerOnVacation', { name: partner.name ?? tc('unknown') })}
                </p>
              )}
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </div>
        </Link>
      )}

      <TodaySection
        completed={completedToday}
        due={dueTasks}
        suggestions={suggestions}
        partnerId={partner?.id}
        partnerName={partner?.name ?? t('partner')}
        decayHoursByInterval={config.decayHoursByInterval}
        vacationStart={vacationStart}
        vacationEnd={vacationEnd}
        dogTrainingContext={dogTrainingContext}
        currentUserId={userId}
      />

      <WeekChart
        days={weekDays}
        userName={me.name ?? t('me')}
        partnerName={partner?.name ?? t('partner')}
      />

      <div className="flex justify-end -mt-2 mb-4">
        <Link href="/stats" className="text-xs text-accent hover:text-accent-hover transition-colors">
          {t('allStats')}
        </Link>
      </div>

      <GroupedFeed groups={feedGroups} currentUserId={userId} />
    </div>
  )
}
