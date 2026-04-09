// prisma/seed-dog-training.ts
import { PrismaClient } from "../src/generated/prisma"
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
  for (const skill of ALL_DOG_SKILLS) {
    await prisma.dogSkillDefinition.upsert({
      where: { id: skill.id },
      create: {
        ...skill,
        isSystem: true,
      },
      update: {
        categoryId: skill.categoryId,
        nameDe: skill.nameDe,
        nameEn: skill.nameEn,
        descriptionDe: skill.descriptionDe,
        descriptionEn: skill.descriptionEn,
        difficulty: skill.difficulty,
        phase: skill.phase,
        prerequisiteIds: skill.prerequisiteIds,
        sortOrder: skill.sortOrder,
        isSystem: true,
      },
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
