// prisma/seed/dog-training/types.ts
export type SkillSeed = {
  id: string
  categoryId: string
  nameDe: string
  nameEn: string
  descriptionDe: string
  descriptionEn: string
  stepsDe?: string[]
  stepsEn?: string[]
  mistakesDe?: string[]
  mistakesEn?: string[]
  progressionDe?: string
  progressionEn?: string
  proTipDe?: string
  proTipEn?: string
  durationMin?: number
  frequencyPerDay?: number
  estimatedDays?: number
  methodology?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  phase: "puppy" | "adolescent" | "adult" | "advanced"
  prerequisiteIds: string
  sortOrder: number
}
