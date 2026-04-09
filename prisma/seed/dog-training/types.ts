// prisma/seed/dog-training/types.ts
export type SkillSeed = {
  id: string
  categoryId: string
  nameDe: string
  nameEn: string
  descriptionDe: string
  descriptionEn: string
  difficulty: "beginner" | "intermediate" | "advanced"
  phase: "puppy" | "adolescent" | "adult" | "advanced"
  prerequisiteIds: string
  sortOrder: number
}
