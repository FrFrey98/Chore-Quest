import { DEFAULT_LEVEL_DEFINITIONS, type LevelDef } from '@/lib/config'

export function getCurrentPoints(earned: number, spent: number): number {
  return Math.max(0, earned - spent)
}

export function getTotalEarned(completions: { points: number }[]): number {
  return completions.reduce((sum, c) => sum + c.points, 0)
}

export function getLevel(
  totalEarned: number,
  levels?: LevelDef[]
): { level: number; title: string; minPoints: number } {
  const l = levels ?? DEFAULT_LEVEL_DEFINITIONS
  const current = [...l].reverse().find((lv) => totalEarned >= lv.minPoints)
  return current ?? l[0]
}
