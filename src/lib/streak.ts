import { prisma } from '@/lib/prisma'

export const STREAK_TIERS = [
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 7,  percent: 10, name: 'Feuer-Starter' },
  { minDays: 3,  percent: 5,  name: 'Warm-up' },
  { minDays: 0,  percent: 0,  name: 'Kein Bonus' },
] as const

export const TEAMWORK_BONUS_PERCENT = 10

export type StreakTier = {
  minDays: number
  percent: number
  name: string
}

export function getStreakTier(currentStreak: number): StreakTier {
  return STREAK_TIERS.find((t) => currentStreak >= t.minDays) ?? STREAK_TIERS[STREAK_TIERS.length - 1]
}

export function applyBonus(basePoints: number, currentStreak: number, isShared: boolean = false): number {
  const tier = getStreakTier(currentStreak)
  const totalPercent = tier.percent + (isShared ? TEAMWORK_BONUS_PERCENT : 0)
  return Math.floor(basePoints * (1 + totalPercent / 100))
}

export function calculateRestorePrice(currentStreak: number): number {
  return 20 + 5 * currentStreak
}

export function getNextTier(currentStreak: number): { tier: StreakTier; daysNeeded: number } | null {
  const nextTier = [...STREAK_TIERS].reverse().find((t) => t.minDays > currentStreak)
  if (!nextTier) return null
  return { tier: nextTier, daysNeeded: nextTier.minDays - currentStreak }
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

export async function getOrCreateStreakState(userId: string) {
  const existing = await prisma.streakState.findUnique({ where: { userId } })
  if (existing) return existing

  // Initialize from TaskCompletions
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    select: { completedAt: true },
    orderBy: { completedAt: 'asc' },
  })

  if (completions.length === 0) {
    return prisma.streakState.create({
      data: { userId, currentStreak: 0, bestStreak: 0 },
    })
  }

  // Calculate current streak from completions
  const daySet = new Set(completions.map((c) => toDateKey(c.completedAt)))
  let currentStreak = 0
  const today = new Date()
  const todayKey = toDateKey(today)
  const startDay = daySet.has(todayKey) ? 0 : 1
  for (let i = startDay; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    if (daySet.has(toDateKey(d))) currentStreak++
    else break
  }

  // Calculate best streak from completions
  const sortedDays = [...daySet].sort()
  let bestStreak = 0
  let runLength = 1
  for (let i = 1; i < sortedDays.length; i++) {
    if (daysBetween(sortedDays[i - 1], sortedDays[i]) === 1) {
      runLength++
    } else {
      bestStreak = Math.max(bestStreak, runLength)
      runLength = 1
    }
  }
  bestStreak = Math.max(bestStreak, runLength, currentStreak)

  const lastCompletion = completions[completions.length - 1]

  return prisma.streakState.create({
    data: {
      userId,
      currentStreak,
      bestStreak,
      lastActiveAt: lastCompletion.completedAt,
    },
  })
}

export async function updateStreakOnCompletion(userId: string): Promise<{ currentStreak: number; bonusPercent: number }> {
  const state = await getOrCreateStreakState(userId)
  const todayKey = toDateKey(new Date())
  const lastActiveKey = state.lastActiveAt ? toDateKey(state.lastActiveAt) : null

  let newStreak: number
  if (lastActiveKey === todayKey) {
    // Already completed today — streak stays the same
    newStreak = state.currentStreak
  } else if (lastActiveKey && daysBetween(lastActiveKey, todayKey) === 1) {
    // Consecutive day — increment
    newStreak = state.currentStreak + 1
  } else {
    // Gap of 2+ days — reset to 1
    newStreak = 1
  }

  const newBest = Math.max(state.bestStreak, newStreak)

  await prisma.streakState.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastActiveAt: new Date(),
    },
  })

  return { currentStreak: newStreak, bonusPercent: getStreakTier(newStreak).percent }
}

export async function isRestoreAvailable(
  userId: string
): Promise<{ available: boolean; price: number; currentStreak: number }> {
  const state = await getOrCreateStreakState(userId)

  if (state.currentStreak === 0 || !state.lastActiveAt) {
    return { available: false, price: 0, currentStreak: 0 }
  }

  const todayKey = toDateKey(new Date())
  const lastActiveKey = toDateKey(state.lastActiveAt)
  const gap = daysBetween(lastActiveKey, todayKey)

  // Restore only available if exactly 2 days gap (missed yesterday)
  if (gap !== 2) {
    return { available: false, price: 0, currentStreak: state.currentStreak }
  }

  // Check not already restored today
  if (state.lastRestoredAt && toDateKey(state.lastRestoredAt) === todayKey) {
    return { available: false, price: 0, currentStreak: state.currentStreak }
  }

  const price = calculateRestorePrice(state.currentStreak)

  // Check if user has enough points
  const [completions, purchases] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      select: { points: true },
    }),
    prisma.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    }),
  ])

  const earned = completions.reduce((sum, c) => sum + c.points, 0)
  const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
  const balance = Math.max(0, earned - spent)

  return {
    available: balance >= price,
    price,
    currentStreak: state.currentStreak,
  }
}

export async function executeRestore(userId: string): Promise<{ success: boolean; error?: string }> {
  const restoreInfo = await isRestoreAvailable(userId)
  if (!restoreInfo.available) {
    return { success: false, error: 'Wiederherstellung nicht verfügbar' }
  }

  const state = await prisma.streakState.findUnique({ where: { userId } })
  if (!state) return { success: false, error: 'Kein Streak-State vorhanden' }

  // Create a purchase for the restore cost
  // First, ensure a streak_restore StoreItem exists
  let restoreItem = await prisma.storeItem.findFirst({
    where: { type: 'streak_restore' },
  })
  if (!restoreItem) {
    restoreItem = await prisma.storeItem.create({
      data: {
        title: 'Streak-Wiederherstellung',
        description: 'Stelle deine verlorene Streak wieder her',
        emoji: '🔄',
        pointCost: restoreInfo.price,
        type: 'streak_restore',
        isActive: false, // Not visible in store
      },
    })
  }

  await prisma.$transaction(async (tx) => {
    // Re-verify points inside transaction
    const completions = await tx.taskCompletion.findMany({
      where: { userId },
      select: { points: true },
    })
    const purchases = await tx.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    })
    const earned = completions.reduce((sum, c) => sum + c.points, 0)
    const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
    const balance = Math.max(0, earned - spent)

    if (balance < restoreInfo.price) {
      throw new Error('INSUFFICIENT_POINTS')
    }

    // Create purchase record
    await tx.purchase.create({
      data: {
        itemId: restoreItem!.id,
        userId,
        pointsSpent: restoreInfo.price,
      },
    })

    // Update streak state: keep streak, set lastActiveAt to yesterday
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(23, 59, 59, 0)

    await tx.streakState.update({
      where: { userId },
      data: {
        lastActiveAt: yesterday,
        restoreCount: { increment: 1 },
        lastRestoredAt: new Date(),
      },
    })
  })

  return { success: true }
}
