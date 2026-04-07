import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { getCurrentPoints, getTotalEarned, getChallengeBonusEarned } from '@/lib/points'
import {
  getOrCreateStreakState,
  getStreakTier,
  getNextTier,
  isRestoreAvailable,
} from '@/lib/streak'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await loadGameConfig()
  const userId = session.user.id
  const state = await getOrCreateStreakState(userId)
  const tier = getStreakTier(state.currentStreak, config.streakTiers)
  const nextTier = getNextTier(state.currentStreak, config.streakTiers)
  const restoreInfo = await isRestoreAvailable(userId, { basePrice: config.restoreBasePrice, perDayPrice: config.restorePerDayPrice })

  // Points balance
  const [completions, purchases, challengeBonus] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      select: { points: true, completedAt: true },
    }),
    prisma.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    }),
    getChallengeBonusEarned(userId),
  ])
  const earned = getTotalEarned(completions) + challengeBonus
  const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)

  // Heatmap
  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  return NextResponse.json({
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    restoreCount: state.restoreCount,
    lastActiveAt: state.lastActiveAt?.toISOString() ?? null,
    tier: { name: tier.name, percent: tier.percent },
    nextTier: nextTier
      ? { name: nextTier.tier.name, percent: nextTier.tier.percent, daysNeeded: nextTier.daysNeeded }
      : null,
    restore: {
      available: restoreInfo.available,
      price: restoreInfo.price,
    },
    balance,
    heatmap,
  })
}
