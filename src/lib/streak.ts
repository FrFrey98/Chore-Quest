export const STREAK_TIERS = [
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 7,  percent: 10, name: 'Feuer-Starter' },
  { minDays: 3,  percent: 5,  name: 'Warm-up' },
  { minDays: 0,  percent: 0,  name: 'Kein Bonus' },
] as const

export type StreakTier = {
  minDays: number
  percent: number
  name: string
}

export function getStreakTier(currentStreak: number): StreakTier {
  return STREAK_TIERS.find((t) => currentStreak >= t.minDays) ?? STREAK_TIERS[STREAK_TIERS.length - 1]
}

export function applyBonus(basePoints: number, currentStreak: number): number {
  const tier = getStreakTier(currentStreak)
  return Math.floor(basePoints * (1 + tier.percent / 100))
}

export function calculateRestorePrice(currentStreak: number): number {
  return 20 + 5 * currentStreak
}

export function getNextTier(currentStreak: number): { tier: StreakTier; daysNeeded: number } | null {
  const nextTier = [...STREAK_TIERS].reverse().find((t) => t.minDays > currentStreak)
  if (!nextTier) return null
  return { tier: nextTier, daysNeeded: nextTier.minDays - currentStreak }
}
