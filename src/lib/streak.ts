import { prisma } from '@/lib/prisma'
import {
  DEFAULT_STREAK_TIERS,
  DEFAULT_TEAMWORK_BONUS_PERCENT,
  DEFAULT_RESTORE_BASE_PRICE,
  DEFAULT_RESTORE_PER_DAY_PRICE,
  type StreakTierDef,
} from '@/lib/config'

export function getStreakTier(currentStreak: number, tiers?: StreakTierDef[]): StreakTierDef {
  const t = tiers ?? DEFAULT_STREAK_TIERS
  return t.find((tier) => currentStreak >= tier.minDays) ?? t[t.length - 1]
}

export function applyBonus(
  basePoints: number,
  currentStreak: number,
  isShared: boolean = false,
  opts?: { tiers?: StreakTierDef[]; teamworkPercent?: number }
): number {
  const tier = getStreakTier(currentStreak, opts?.tiers)
  const teamwork = opts?.teamworkPercent ?? DEFAULT_TEAMWORK_BONUS_PERCENT
  const totalPercent = tier.percent + (isShared ? teamwork : 0)
  return Math.floor(basePoints * (1 + totalPercent / 100))
}

export function calculateRestorePrice(
  currentStreak: number,
  opts?: { basePrice?: number; perDayPrice?: number }
): number {
  const base = opts?.basePrice ?? DEFAULT_RESTORE_BASE_PRICE
  const perDay = opts?.perDayPrice ?? DEFAULT_RESTORE_PER_DAY_PRICE
  return base + perDay * currentStreak
}

export function getNextTier(currentStreak: number, tiers?: StreakTierDef[]): { tier: StreakTierDef; daysNeeded: number } | null {
  const t = tiers ?? DEFAULT_STREAK_TIERS
  const nextTier = [...t].reverse().find((tier) => tier.minDays > currentStreak)
  if (!nextTier) return null
  return { tier: nextTier, daysNeeded: nextTier.minDays - currentStreak }
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

/** Returns the effective current streak, accounting for broken streaks since last activity. */
export function getEffectiveStreak(state: { currentStreak: number; lastActiveAt: Date | null }): number {
  if (!state.lastActiveAt || state.currentStreak === 0) return 0
  const todayKey = toDateKey(new Date())
  const lastKey = toDateKey(state.lastActiveAt)
  const gap = daysBetween(lastKey, todayKey)
  if (gap <= 1) return state.currentStreak // today or yesterday — streak is still alive
  return 0 // gap of 2+ days — streak is broken
}

/**
 * Calculate the current streak from a list of UTC date keys (YYYY-MM-DD).
 * Walks backwards from today/yesterday counting consecutive days.
 * Pure function — no DB access. Used by recalculateStreak().
 */
export function recalculateStreakFromDates(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0

  const uniqueDays = [...new Set(dateKeys)].sort().reverse()
  const todayKey = toDateKey(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1)
  const yesterdayKey = toDateKey(yesterdayDate)

  // Find start: must be today or yesterday
  const startKey = uniqueDays[0]
  if (startKey !== todayKey && startKey !== yesterdayKey) return 0

  let streak = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    if (daysBetween(uniqueDays[i], uniqueDays[i - 1]) === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Recalculate streak for a user from their actual completion records.
 * Updates StreakState in the database. Used after undo/backfill.
 */
export async function recalculateStreak(userId: string): Promise<void> {
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    select: { completedAt: true },
  })

  const dateKeys = completions.map((c) => toDateKey(c.completedAt))
  const newStreak = recalculateStreakFromDates(dateKeys)
  const lastCompletion = completions.length > 0
    ? completions.reduce((latest, c) => c.completedAt > latest.completedAt ? c : latest).completedAt
    : null

  const state = await getOrCreateStreakState(userId)
  const newBest = Math.max(state.bestStreak, newStreak)

  await prisma.streakState.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastActiveAt: lastCompletion,
    },
  })
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

export async function updateStreakOnCompletion(
  userId: string,
  tiers?: StreakTierDef[]
): Promise<{ currentStreak: number; bonusPercent: number }> {
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

  return { currentStreak: newStreak, bonusPercent: getStreakTier(newStreak, tiers).percent }
}

export async function isRestoreAvailable(
  userId: string,
  opts?: { basePrice?: number; perDayPrice?: number }
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

  const price = calculateRestorePrice(state.currentStreak, opts)

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

export async function executeRestore(
  userId: string,
  opts?: { basePrice?: number; perDayPrice?: number }
): Promise<{ success: boolean; error?: string }> {
  const restoreInfo = await isRestoreAvailable(userId, opts)
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
