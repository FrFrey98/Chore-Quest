"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { APP_CONFIG_FEATURE_KEY, DOG_TRAINING_CATEGORY_ID } from "@/lib/dog-training/types"
import {
  DOG_TRAINING_CATEGORIES,
  DOG_TRAINING_ACHIEVEMENTS,
  ALL_DOG_SKILLS,
} from "../../../../prisma/seed/dog-training"

export async function toggleDogTrainingFeature(enabled: boolean): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")
  if (user.role !== "admin") throw new Error("Nur Admins dürfen das Feature aktivieren")

  await prisma.$transaction(async (tx) => {
    await tx.appConfig.upsert({
      where: { key: APP_CONFIG_FEATURE_KEY },
      create: { key: APP_CONFIG_FEATURE_KEY, value: enabled ? "true" : "false" },
      update: { value: enabled ? "true" : "false" },
    })

    if (enabled) {
      // Upsert the system category
      await tx.category.upsert({
        where: { id: DOG_TRAINING_CATEGORY_ID },
        create: {
          id: DOG_TRAINING_CATEGORY_ID,
          name: "Hundetraining",
          emoji: "🐕",
          isSystem: true,
        },
        update: {
          isSystem: true,
        },
      })

      // Seed skill categories, skill definitions, and achievements (idempotent upserts)
      for (const cat of DOG_TRAINING_CATEGORIES) {
        await tx.dogSkillCategory.upsert({
          where: { id: cat.id },
          create: cat,
          update: cat,
        })
      }

      for (const skill of ALL_DOG_SKILLS) {
        await tx.dogSkillDefinition.upsert({
          where: { id: skill.id },
          create: { ...skill, isSystem: true },
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

      for (const ach of DOG_TRAINING_ACHIEVEMENTS) {
        await tx.dogAchievement.upsert({
          where: { id: ach.id },
          create: ach,
          update: ach,
        })
      }

      // Create system tasks for existing dogs
      const dogs = await tx.dog.findMany({ where: { archivedAt: null } })
      for (const dog of dogs) {
        await ensureDogSystemTask(tx, dog.id, dog.name, user.id)
      }
    }
  })

  revalidatePath("/")
  revalidatePath("/hunde")
  revalidatePath("/settings")
}

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export async function ensureDogSystemTask(
  tx: TxClient,
  dogId: string,
  dogName: string,
  createdById: string,
): Promise<void> {
  const existing = await tx.task.findFirst({
    where: {
      categoryId: DOG_TRAINING_CATEGORY_ID,
      isSystem: true,
      dogId,
    },
  })
  if (existing) return

  await tx.task.create({
    data: {
      title: `🐕 ${dogName} trainieren`,
      emoji: "🐕",
      points: 0,
      isRecurring: true,
      recurringInterval: "daily",
      status: "active",
      categoryId: DOG_TRAINING_CATEGORY_ID,
      createdById,
      allowMultiple: true,
      isSystem: true,
      dogId,
    },
  })
}
