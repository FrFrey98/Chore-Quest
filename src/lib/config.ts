import { prisma } from '@/lib/prisma'

// --- Default constants (match current hardcoded values) ---

export type StreakTierDef = { minDays: number; percent: number; name: string }
export type LevelDef = { level: number; minPoints: number; title: string }

export const DEFAULT_STREAK_TIERS: StreakTierDef[] = [
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 7,  percent: 10, name: 'Feuer-Starter' },
  { minDays: 3,  percent: 5,  name: 'Warm-up' },
  { minDays: 0,  percent: 0,  name: 'Kein Bonus' },
]

export const DEFAULT_TEAMWORK_BONUS_PERCENT = 10
export const DEFAULT_RESTORE_BASE_PRICE = 20
export const DEFAULT_RESTORE_PER_DAY_PRICE = 5

export const DEFAULT_LEVEL_DEFINITIONS: LevelDef[] = [
  { level: 1, minPoints: 0,    title: 'Haushaltslehrling' },
  { level: 2, minPoints: 200,  title: 'Ordnungs-Fan' },
  { level: 3, minPoints: 500,  title: 'Putz-Profi' },
  { level: 4, minPoints: 1000, title: 'Haushalts-Held' },
  { level: 5, minPoints: 2000, title: 'Hygiene-Legende' },
  { level: 6, minPoints: 4000, title: 'Wohn-Meister' },
]

export const DEFAULT_RECURRING_INTERVALS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
}

// --- Config CRUD ---

export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  const row = await prisma.appConfig.findUnique({ where: { key } })
  if (!row) return defaultValue
  try {
    return JSON.parse(row.value) as T
  } catch {
    return defaultValue
  }
}

export async function setConfig<T>(key: string, value: T): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  })
}

// --- Bulk loader for server-side use ---

export type GameConfig = {
  streakTiers: StreakTierDef[]
  teamworkBonusPercent: number
  restoreBasePrice: number
  restorePerDayPrice: number
  levelDefinitions: LevelDef[]
  recurringIntervals: Record<string, number>
}

export async function loadGameConfig(): Promise<GameConfig> {
  const [streakTiers, teamworkBonusPercent, restoreBasePrice, restorePerDayPrice, levelDefinitions, recurringIntervals] =
    await Promise.all([
      getConfig('streak_tiers', DEFAULT_STREAK_TIERS),
      getConfig('teamwork_bonus_percent', DEFAULT_TEAMWORK_BONUS_PERCENT),
      getConfig('restore_base_price', DEFAULT_RESTORE_BASE_PRICE),
      getConfig('restore_per_day_price', DEFAULT_RESTORE_PER_DAY_PRICE),
      getConfig('level_definitions', DEFAULT_LEVEL_DEFINITIONS),
      getConfig('recurring_intervals', DEFAULT_RECURRING_INTERVALS),
    ])
  return { streakTiers, teamworkBonusPercent, restoreBasePrice, restorePerDayPrice, levelDefinitions, recurringIntervals }
}
