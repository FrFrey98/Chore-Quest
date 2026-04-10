"use server"

import { prisma } from "@/lib/prisma"
import { requireDogTrainingAccess } from "./_require-access"

export async function getDogSessionHistory(dogId: string, limit = 30) {
  await requireDogTrainingAccess()
  const sessions = await prisma.dogTrainingSession.findMany({
    where: { dogId },
    orderBy: { completedAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true } },
      withUser: { select: { id: true, name: true } },
      skillsTrained: {
        include: {
          skillDefinition: { select: { id: true, nameDe: true, nameEn: true } },
        },
      },
    },
  })
  return sessions
}
