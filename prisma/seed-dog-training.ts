// prisma/seed-dog-training.ts
import { PrismaClient } from "../src/generated/prisma/client"
import {
  DOG_TRAINING_CATEGORIES,
  DOG_TRAINING_ACHIEVEMENTS,
  ALL_DOG_SKILLS,
} from "./seed/dog-training"

export async function seedDogTraining(prisma: PrismaClient): Promise<void> {
  console.log("  Seeding dog training categories...")
  for (const cat of DOG_TRAINING_CATEGORIES) {
    await prisma.dogSkillCategory.upsert({
      where: { id: cat.id },
      create: cat,
      update: cat,
    })
  }

  console.log(`  Seeding ${ALL_DOG_SKILLS.length} dog training skills...`)
  const jsonOrNull = (v: unknown[] | undefined) => v ? JSON.stringify(v) : null

  for (const skill of ALL_DOG_SKILLS) {
    const data = {
      categoryId: skill.categoryId,
      nameDe: skill.nameDe,
      nameEn: skill.nameEn,
      descriptionDe: skill.descriptionDe,
      descriptionEn: skill.descriptionEn,
      stepsDe: jsonOrNull(skill.stepsDe),
      stepsEn: jsonOrNull(skill.stepsEn),
      mistakesDe: jsonOrNull(skill.mistakesDe),
      mistakesEn: jsonOrNull(skill.mistakesEn),
      progressionDe: skill.progressionDe ?? null,
      progressionEn: skill.progressionEn ?? null,
      proTipDe: skill.proTipDe ?? null,
      proTipEn: skill.proTipEn ?? null,
      durationMin: skill.durationMin ?? null,
      frequencyPerDay: skill.frequencyPerDay ?? null,
      estimatedDays: skill.estimatedDays ?? null,
      methodology: skill.methodology ?? null,
      difficulty: skill.difficulty,
      phase: skill.phase,
      prerequisiteIds: skill.prerequisiteIds,
      sortOrder: skill.sortOrder,
      isSystem: true,
    }
    await prisma.dogSkillDefinition.upsert({
      where: { id: skill.id },
      create: { id: skill.id, ...data },
      update: data,
    })
  }

  console.log("  Seeding dog training achievements...")
  for (const ach of DOG_TRAINING_ACHIEVEMENTS) {
    await prisma.dogAchievement.upsert({
      where: { id: ach.id },
      create: ach,
      update: ach,
    })
  }

  console.log("  Dog training seed complete.")
}
