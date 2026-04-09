"use server"

import { prisma } from "@/lib/prisma"
import { applyDecay } from "@/lib/dog-training/decay"
import { calculatePillarHealth } from "@/lib/dog-training/pillar-health"
import type { SkillStatus } from "@/lib/dog-training/types"

export async function getDogOverview(dogId: string) {
  const dog = await prisma.dog.findUnique({ where: { id: dogId } })
  if (!dog) return null

  const [definitions, progresses, users, categories] = await Promise.all([
    prisma.dogSkillDefinition.findMany(),
    prisma.dogSkillProgress.findMany({ where: { dogId } }),
    prisma.user.findMany({ select: { vacationStart: true, vacationEnd: true } }),
    prisma.dogSkillCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ])

  const now = new Date()
  const effective = definitions.map((def) => {
    const p = progresses.find((x) => x.skillDefinitionId === def.id)
    const baseState = {
      status: (p?.status ?? "new") as SkillStatus,
      progress: p?.progress ?? 0,
      bestStatus: (p?.bestStatus ?? "new") as SkillStatus,
      trainedCount: p?.trainedCount ?? 0,
      lastTrainedAt: p?.lastTrainedAt ?? null,
    }
    const eff = applyDecay({
      status: baseState.status,
      progress: baseState.progress,
      bestStatus: baseState.bestStatus,
      lastTrainedAt: baseState.lastTrainedAt,
      now,
      dog: { vacationStart: dog.vacationStart, vacationEnd: dog.vacationEnd },
      users,
    })
    return {
      definition: def,
      progressRow: p ?? null,
      effectiveStatus: eff.status,
      effectiveProgress: eff.progress,
      trainedCount: baseState.trainedCount,
      lastTrainedAt: baseState.lastTrainedAt,
    }
  })

  const pillars = categories.map((cat) => {
    const skills = effective.filter((e) => e.definition.categoryId === cat.id)
    const health = calculatePillarHealth(
      skills.map((s) => ({
        status: s.effectiveStatus,
        progress: s.effectiveProgress,
        trainedCount: s.trainedCount,
      })),
    )
    return { category: cat, skills, health }
  })

  return { dog, pillars }
}
