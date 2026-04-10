"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { DOG_PHASES, DOG_TRAINING_CATEGORY_ID } from "@/lib/dog-training/types"

const updateDogSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60).optional(),
  emoji: z.string().min(1).max(4).optional(),
  photoBase64: z.string().max(500_000).nullable().optional(),
  breed: z.string().max(120).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  birthDate: z.date().nullable().optional(),
  phase: z.enum(DOG_PHASES as unknown as [string, ...string[]]).optional(),
  notes: z.string().max(2000).nullable().optional(),
  vacationStart: z.date().nullable().optional(),
  vacationEnd: z.date().nullable().optional(),
})

export type UpdateDogInput = z.infer<typeof updateDogSchema>

export async function updateDog(input: UpdateDogInput) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")
  const { id, ...rest } = updateDogSchema.parse(input)

  const dog = await prisma.dog.update({
    where: { id },
    data: rest,
  })

  if (rest.name) {
    await prisma.task.updateMany({
      where: { dogId: id, isSystem: true, categoryId: DOG_TRAINING_CATEGORY_ID },
      data: { title: `🐕 ${rest.name} trainieren` },
    })
  }

  revalidatePath("/hunde")
  return dog
}
