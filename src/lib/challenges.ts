import { prisma } from './prisma'

export const CHALLENGE_TYPES = ['task_count', 'category_count', 'streak_days', 'teamwork_count'] as const
export type ChallengeType = (typeof CHALLENGE_TYPES)[number]

interface ChallengeTemplate {
  type: ChallengeType
  emoji: string
  titleFn: (target: number, categoryName?: string) => string
  titleDeFn: (target: number, categoryName?: string) => string
  descriptionFn: (target: number, categoryName?: string) => string
  descriptionDeFn: (target: number, categoryName?: string) => string
  getTarget: (avgWeekly: number) => number
  bonusPoints: (target: number) => number
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    type: 'task_count',
    emoji: '🎯',
    titleFn: (t) => `Complete ${t} tasks this week`,
    titleDeFn: (t) => `Erledige ${t} Aufgaben diese Woche`,
    descriptionFn: (t) => `Finish ${t} tasks before the week ends to earn bonus points!`,
    descriptionDeFn: (t) => `Schließe ${t} Aufgaben vor Wochenende ab und erhalte Bonuspunkte!`,
    getTarget: (avg) => Math.max(3, Math.round(avg * 1.2)),
    bonusPoints: (t) => Math.min(30, Math.max(20, t * 2)),
  },
  {
    type: 'category_count',
    emoji: '📂',
    titleFn: (t, cat) => `Complete ${t} ${cat} tasks this week`,
    titleDeFn: (t, cat) => `Erledige ${t} ${cat}-Aufgaben diese Woche`,
    descriptionFn: (t, cat) => `Focus on ${cat} and complete ${t} tasks for bonus points!`,
    descriptionDeFn: (t, cat) => `Konzentriere dich auf ${cat} und erledige ${t} Aufgaben für Bonuspunkte!`,
    getTarget: (avg) => Math.max(2, Math.round(avg * 1.3)),
    bonusPoints: (t) => Math.min(35, Math.max(25, t * 3)),
  },
  {
    type: 'streak_days',
    emoji: '🔥',
    titleFn: () => 'Keep your streak for 7 days',
    titleDeFn: () => 'Halte deine Serie 7 Tage lang',
    descriptionFn: () => 'Complete at least one task every day this week to keep your streak alive!',
    descriptionDeFn: () => 'Erledige jeden Tag mindestens eine Aufgabe, um deine Serie aufrechtzuerhalten!',
    getTarget: () => 7,
    bonusPoints: () => 40,
  },
  {
    type: 'teamwork_count',
    emoji: '🤝',
    titleFn: (t) => `Complete ${t} tasks together this week`,
    titleDeFn: (t) => `Erledige ${t} Aufgaben gemeinsam diese Woche`,
    descriptionFn: (t) => `Team up and complete ${t} shared tasks for bonus points!`,
    descriptionDeFn: (t) => `Arbeitet zusammen und erledigt ${t} gemeinsame Aufgaben für Bonuspunkte!`,
    getTarget: (avg) => Math.max(2, Math.round(avg * 1.2)),
    bonusPoints: (t) => Math.min(30, Math.max(30, t * 3)),
  },
]

function getWeekBoundaries(now: Date = new Date()): { weekStart: Date; weekEnd: Date } {
  const weekStart = new Date(now)
  const day = weekStart.getDay()
  // Monday = 1, Sunday = 0 -> shift so Monday is start
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return { weekStart, weekEnd }
}

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export async function generateWeeklyChallenges() {
  const { weekStart, weekEnd } = getWeekBoundaries()

  // Check if challenges already exist for this week
  const existing = await prisma.challenge.findFirst({
    where: {
      weekStart: { gte: weekStart },
      weekEnd: { lte: weekEnd },
    },
  })

  if (existing) {
    return { created: false, reason: 'Challenges already exist for this week' }
  }

  // Get all users
  const users = await prisma.user.findMany({ select: { id: true } })
  if (users.length === 0) {
    return { created: false, reason: 'No users found' }
  }

  // Calculate averages from last 4 weeks
  const fourWeeksAgo = new Date(weekStart)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

  const recentCompletions = await prisma.taskCompletion.findMany({
    where: { completedAt: { gte: fourWeeksAgo, lt: weekStart } },
    select: { id: true, userId: true, taskId: true, withUserId: true, completedAt: true },
  })

  // Average weekly task completions (across all users)
  const avgWeeklyTasks = recentCompletions.length / 4 / Math.max(1, users.length)

  // Average weekly shared completions
  const sharedCompletions = recentCompletions.filter((c) => c.withUserId !== null)
  const avgWeeklyShared = sharedCompletions.length / 4 / Math.max(1, users.length)

  // Get categories for category_count challenge
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  })

  // Per-category average
  const categoryCompletions = await prisma.taskCompletion.findMany({
    where: { completedAt: { gte: fourWeeksAgo, lt: weekStart } },
    select: { task: { select: { categoryId: true } } },
  })

  const categoryCounts: Record<string, number> = {}
  for (const c of categoryCompletions) {
    categoryCounts[c.task.categoryId] = (categoryCounts[c.task.categoryId] || 0) + 1
  }

  // Pick 3 random challenge types
  const pickedTemplates = shuffleAndPick(TEMPLATES, 3)

  const createdChallenges = []

  for (const template of pickedTemplates) {
    let target: number
    let categoryName: string | undefined
    let categoryId: string | undefined

    if (template.type === 'category_count' && categories.length > 0) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      categoryId = randomCategory.id
      categoryName = randomCategory.name
      const catAvg = (categoryCounts[randomCategory.id] || 0) / 4 / Math.max(1, users.length)
      target = template.getTarget(catAvg)
    } else if (template.type === 'teamwork_count') {
      target = template.getTarget(avgWeeklyShared)
    } else if (template.type === 'streak_days') {
      target = template.getTarget(0)
    } else {
      target = template.getTarget(avgWeeklyTasks)
    }

    const bonus = template.bonusPoints(target)

    const challenge = await prisma.challenge.create({
      data: {
        type: template.type,
        title: template.titleFn(target, categoryName),
        titleDe: template.titleDeFn(target, categoryName),
        description: template.descriptionFn(target, categoryName),
        descriptionDe: template.descriptionDeFn(target, categoryName),
        emoji: template.emoji,
        targetValue: target,
        bonusPoints: bonus,
        weekStart,
        weekEnd,
        categoryId: categoryId || null,
      },
    })

    createdChallenges.push(challenge)

    // Create UserChallenge for each user
    await prisma.userChallenge.createMany({
      data: users.map((user) => ({
        userId: user.id,
        challengeId: challenge.id,
      })),
    })
  }

  return {
    created: true,
    challenges: createdChallenges.map((c) => ({ id: c.id, type: c.type, title: c.title })),
    userCount: users.length,
  }
}

/**
 * Update challenge progress for a user after task completion.
 * Returns array of newly completed challenges (for bonus points and notifications).
 */
export async function updateChallengeProgress(
  userId: string,
  taskCategoryId: string,
  isShared: boolean
): Promise<Array<{ id: string; title: string; titleDe: string; emoji: string; bonusPoints: number }>> {
  const now = new Date()

  // Get active user challenges for this week
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      completedAt: null,
      challenge: {
        weekStart: { lte: now },
        weekEnd: { gte: now },
      },
    },
    include: { challenge: true },
  })

  const completed: Array<{ id: string; title: string; titleDe: string; emoji: string; bonusPoints: number }> = []

  for (const uc of userChallenges) {
    if (uc.challenge.type === 'streak_days') continue

    let shouldIncrement = false

    switch (uc.challenge.type) {
      case 'task_count':
        shouldIncrement = true
        break
      case 'category_count':
        shouldIncrement = uc.challenge.categoryId === taskCategoryId
        break
      case 'teamwork_count':
        shouldIncrement = isShared
        break
    }

    if (shouldIncrement) {
      const newProgress = uc.currentProgress + 1
      const isNowComplete = newProgress >= uc.challenge.targetValue

      await prisma.userChallenge.update({
        where: { id: uc.id },
        data: {
          currentProgress: newProgress,
          completedAt: isNowComplete ? now : null,
        },
      })

      if (isNowComplete) {
        completed.push({
          id: uc.challenge.id,
          title: uc.challenge.title,
          titleDe: uc.challenge.titleDe,
          emoji: uc.challenge.emoji,
          bonusPoints: uc.challenge.bonusPoints,
        })
      }
    }
  }

  // Handle streak_days challenges separately — check actual streak value
  const streakChallenges = userChallenges.filter((uc) => uc.challenge.type === 'streak_days' && !uc.completedAt)
  if (streakChallenges.length > 0) {
    const streakState = await prisma.streakState.findUnique({ where: { userId } })
    if (streakState) {
      for (const uc of streakChallenges) {
        if (streakState.currentStreak >= uc.challenge.targetValue && !uc.completedAt) {
          await prisma.userChallenge.update({
            where: { id: uc.id },
            data: {
              currentProgress: streakState.currentStreak,
              completedAt: now,
            },
          })
          completed.push({
            id: uc.challenge.id,
            title: uc.challenge.title,
            titleDe: uc.challenge.titleDe,
            emoji: uc.challenge.emoji,
            bonusPoints: uc.challenge.bonusPoints,
          })
        } else {
          await prisma.userChallenge.update({
            where: { id: uc.id },
            data: { currentProgress: streakState.currentStreak },
          })
        }
      }
    }
  }

  return completed
}
