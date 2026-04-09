"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { DOG_TRAINING_CATEGORY_ID } from "@/lib/dog-training/types"

export async function archiveDog(dogId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")

  await prisma.$transaction(async (tx) => {
    const dog = await tx.dog.update({
      where: { id: dogId },
      data: { archivedAt: new Date() },
    })

    // Deactivate the associated system task
    await tx.task.updateMany({
      where: {
        categoryId: DOG_TRAINING_CATEGORY_ID,
        isSystem: true,
        dogId,
      },
      data: { status: "archived" },
    })
  })

  revalidatePath("/hunde")
  revalidatePath("/")
}
