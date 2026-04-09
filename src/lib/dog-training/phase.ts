import type { DogPhase } from "./types"

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function suggestPhase(birthDate: Date | null, now: Date = new Date()): DogPhase {
  if (!birthDate) return "adult"
  const days = (now.getTime() - birthDate.getTime()) / MS_PER_DAY
  if (days < 120) return "puppy"
  if (days < 365) return "adolescent"
  if (days < 365 * 7) return "adult"
  return "senior"
}
