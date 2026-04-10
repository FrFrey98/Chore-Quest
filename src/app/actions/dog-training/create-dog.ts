"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { DOG_PHASES, APP_CONFIG_FEATURE_KEY } from "@/lib/dog-training/types"
import { ensureDogSystemTask } from "./toggle-feature"

const createDogSchema = z.object({
  name: z.string().min(1).max(60),
  emoji: z.string().min(1).max(4).default("🐕"),
  photoBase64: z.string().max(500_000).nullable().optional(),
  breed: z.string().max(120).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  birthDate: z.date().nullable().optional(),
  phase: z.enum(DOG_PHASES as unknown as [string, ...string[]]),
  notes: z.string().max(2000).nullable().optional(),
})

export type CreateDogInput = z.infer<typeof createDogSchema>

export async function createDog(input: CreateDogInput) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")

  const data = createDogSchema.parse(input)

  return await prisma.$transaction(async (tx) => {
    const dog = await tx.dog.create({
      data: {
        name: data.name,
        emoji: data.emoji,
        photoBase64: data.photoBase64 ?? null,
        breed: data.breed ?? null,
        gender: data.gender ?? null,
        birthDate: data.birthDate ?? null,
        phase: data.phase,
        notes: data.notes ?? null,
      },
    })

    const featureEnabled = await tx.appConfig.findUnique({
      where: { key: APP_CONFIG_FEATURE_KEY },
    })
    if (featureEnabled?.value === "true") {
      await ensureDogSystemTask(tx, dog.id, dog.name, user.id)
    }

    revalidatePath("/hunde")
    revalidatePath("/")
    return dog
  })
}
