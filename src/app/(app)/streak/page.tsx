import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentPoints, getTotalEarned } from '@/lib/points'
import {
  STREAK_TIERS,
  getOrCreateStreakState,
  getStreakTier,
  getNextTier,
  isRestoreAvailable,
} from '@/lib/streak'
import { StreakClient } from './streak-client'

export const dynamic = 'force-dynamic'

export default async function StreakPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const state = await getOrCreateStreakState(userId)
  const tier = getStreakTier(state.currentStreak)
  const nextTier = getNextTier(state.currentStreak)
  const restoreInfo = await isRestoreAvailable(userId)

  // Points balance for display
  const [completions, purchases] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId },
      select: { points: true, completedAt: true },
    }),
    prisma.purchase.findMany({
      where: { userId },
      select: { pointsSpent: true },
    }),
  ])
  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((sum, p) => sum + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)

  // Heatmap data
  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  const tiers = [...STREAK_TIERS].reverse()

  return (
    <StreakClient
      currentStreak={state.currentStreak}
      bestStreak={state.bestStreak}
      restoreCount={state.restoreCount}
      tierName={tier.name}
      tierPercent={tier.percent}
      nextTier={nextTier ? { name: nextTier.tier.name, percent: nextTier.tier.percent, daysNeeded: nextTier.daysNeeded } : null}
      restore={{ available: restoreInfo.available, price: restoreInfo.price }}
      balance={balance}
      tiers={tiers.map((t) => ({ minDays: t.minDays, percent: t.percent, name: t.name }))}
      heatmap={heatmap}
    />
  )
}
