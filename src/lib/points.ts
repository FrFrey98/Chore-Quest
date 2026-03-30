export const LEVELS = [
  { level: 1, minPoints: 0,    title: 'Haushaltslehrling' },
  { level: 2, minPoints: 200,  title: 'Ordnungs-Fan' },
  { level: 3, minPoints: 500,  title: 'Putz-Profi' },
  { level: 4, minPoints: 1000, title: 'Haushalts-Held' },
  { level: 5, minPoints: 2000, title: 'Hygiene-Legende' },
  { level: 6, minPoints: 4000, title: 'Wohn-Meister' },
]

export function getCurrentPoints(earned: number, spent: number): number {
  return Math.max(0, earned - spent)
}

export function getTotalEarned(completions: { points: number }[]): number {
  return completions.reduce((sum, c) => sum + c.points, 0)
}

export function getLevel(totalEarned: number): { level: number; title: string; minPoints: number } {
  const current = [...LEVELS]
    .reverse()
    .find((l) => totalEarned >= l.minPoints)
  return current ?? LEVELS[0]
}
