"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { APP_CONFIG_FEATURE_KEY, DOG_TRAINING_CATEGORY_ID } from "@/lib/dog-training/types"

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
  _dogId: string,
  dogName: string,
  createdById: string,
): Promise<void> {
  const existing = await tx.task.findFirst({
    where: {
      categoryId: DOG_TRAINING_CATEGORY_ID,
      isSystem: true,
      title: `🐕 ${dogName} trainieren`,
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
    },
  })
}
