"use server"

import { prisma } from "@/lib/prisma"
import { pickDailyChallenge } from "@/lib/dog-training/daily-challenge"
import type { SkillStatus } from "@/lib/dog-training/types"

export async function getDailyChallenge(dogId: string) {
  const dog = await prisma.dog.findUnique({ where: { id: dogId } })
  if (!dog) return null

  const [defs, progresses] = await Promise.all([
    prisma.dogSkillDefinition.findMany(),
    prisma.dogSkillProgress.findMany({ where: { dogId } }),
  ])

  return pickDailyChallenge({
    dogId,
    dogPhase: dog.phase as "puppy" | "adolescent" | "adult" | "senior" | "advanced",
    skills: defs.map((def) => {
      const p = progresses.find((x) => x.skillDefinitionId === def.id)
      return {
        skillDefinitionId: def.id,
        status: (p?.status ?? "new") as SkillStatus,
        progress: p?.progress ?? 0,
        trainedCount: p?.trainedCount ?? 0,
        bestStatus: (p?.bestStatus ?? "new") as SkillStatus,
        lastTrainedAt: p?.lastTrainedAt ?? null,
        phase: def.phase as "puppy" | "adolescent" | "adult" | "advanced",
        prerequisiteIds: def.prerequisiteIds ? def.prerequisiteIds.split(",").filter(Boolean) : [],
      }
    }),
    today: new Date(),
  })
}
