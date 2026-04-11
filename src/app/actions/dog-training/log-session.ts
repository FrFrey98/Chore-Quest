"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  TRAINING_RATINGS,
  MOOD_LEVELS,
  SESSION_TYPES,
  DOG_TRAINING_CATEGORY_ID,
  type TrainingRating,
} from "@/lib/dog-training/types"
import { applyDecay } from "@/lib/dog-training/decay"
import { applyTrainingBoost } from "@/lib/dog-training/progress"
import { calculateSessionPoints } from "@/lib/dog-training/points"
import { checkAndUnlockDogAchievements } from "./check-achievements"
import { ALLOWED_DURATIONS } from "@/lib/dog-training/constants"

const logSessionSchema = z.object({
  dogId: z.string().min(1),
  skills: z
    .array(
      z.object({
        skillDefinitionId: z.string().min(1),
        rating: z.enum(TRAINING_RATINGS as unknown as [TrainingRating, ...TrainingRating[]]),
      }),
    )
    .min(1, "Mindestens ein Skill muss ausgewählt sein"),
  durationMinutes: z.number().int().refine((n) => (ALLOWED_DURATIONS as readonly number[]).includes(n), {
    message: "Ungültige Dauer",
  }),
  moodLevel: z.enum(MOOD_LEVELS as unknown as [string, ...string[]]).nullable().optional(),
  sessionType: z.enum(SESSION_TYPES as unknown as [string, ...string[]]).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  withUserId: z.string().nullable().optional(),
  recommendedSkillIds: z.array(z.string()).default([]),
})

export type LogSessionInput = z.input<typeof logSessionSchema>

export async function logDogTrainingSession(input: LogSessionInput) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")
  const data = logSessionSchema.parse(input)

  return await prisma.$transaction(async (tx) => {
    const dog = await tx.dog.findUnique({ where: { id: data.dogId } })
    if (!dog) throw new Error("Hund nicht gefunden")
    if (dog.archivedAt) throw new Error("Hund ist archiviert")

    const now = new Date()
    const householdUsers = await tx.user.findMany({
      select: { vacationStart: true, vacationEnd: true },
    })

    // Load all definitions once; filter for validation, use client-provided recommendedSkillIds for bonus calc
    const allDefs = await tx.dogSkillDefinition.findMany()
    const requestedDefIds = new Set(data.skills.map((s) => s.skillDefinitionId))
    const requestedDefs = allDefs.filter((d) => requestedDefIds.has(d.id))
    if (requestedDefs.length !== data.skills.length) {
      throw new Error("Unbekannter Skill im Input")
    }

    // Load progresses for decay/boost calculations
    const allProgresses = await tx.dogSkillProgress.findMany({ where: { dogId: data.dogId } })

    // Use client-provided recommended skill IDs (avoids server-side drift vs UI preview)
    const recommendedIds = data.recommendedSkillIds

    // Compute today's already-earned points for this dog
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(now)
    dayEnd.setHours(23, 59, 59, 999)
    const todaysSessions = await tx.dogTrainingSession.aggregate({
      where: {
        dogId: data.dogId,
        completedAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { pointsAwarded: true },
    })
    const pointsEarnedTodayForDog = todaysSessions._sum.pointsAwarded ?? 0

    // Calculate points
    const pointsResult = calculateSessionPoints({
      durationMinutes: data.durationMinutes,
      skills: data.skills,
      recommendedSkillIds: recommendedIds,
      pointsEarnedTodayForDog,
    })

    // Apply boost to each trained skill
    const levelUps: Array<{ skillId: string; skillName: string; oldStatus: string; newStatus: string }> = []

    for (const skillInput of data.skills) {
      const existing = allProgresses.find(
        (p) => p.skillDefinitionId === skillInput.skillDefinitionId,
      )
      const baseState = existing
        ? {
            status: existing.status as "new" | "acquisition" | "fluency" | "proficiency" | "maintenance" | "mastery",
            progress: existing.progress,
            bestStatus: existing.bestStatus as "new" | "acquisition" | "fluency" | "proficiency" | "maintenance" | "mastery",
            trainedCount: existing.trainedCount,
            firstTrainedAt: existing.firstTrainedAt,
            lastTrainedAt: existing.lastTrainedAt,
          }
        : {
            status: "new" as const,
            progress: 0,
            bestStatus: "new" as const,
            trainedCount: 0,
            firstTrainedAt: null,
            lastTrainedAt: null,
          }

      // Apply decay first
      const decayed = applyDecay({
        status: baseState.status,
        progress: baseState.progress,
        bestStatus: baseState.bestStatus,
        lastTrainedAt: baseState.lastTrainedAt,
        now,
        dog: { vacationStart: dog.vacationStart, vacationEnd: dog.vacationEnd },
        users: householdUsers,
      })

      // Apply training boost
      const boosted = applyTrainingBoost({
        status: decayed.status,
        progress: decayed.progress,
        bestStatus: baseState.bestStatus,
        trainedCount: baseState.trainedCount,
        firstTrainedAt: baseState.firstTrainedAt,
        rating: skillInput.rating,
        now,
      })

      const oldStatus = decayed.status
      const newStatus = boosted.status
      if (oldStatus !== newStatus) {
        const skillDef = requestedDefs.find((d) => d.id === skillInput.skillDefinitionId)
        levelUps.push({
          skillId: skillInput.skillDefinitionId,
          skillName: skillDef?.nameDe ?? skillInput.skillDefinitionId,
          oldStatus,
          newStatus,
        })
      }

      await tx.dogSkillProgress.upsert({
        where: {
          dogId_skillDefinitionId: {
            dogId: data.dogId,
            skillDefinitionId: skillInput.skillDefinitionId,
          },
        },
        create: {
          dogId: data.dogId,
          skillDefinitionId: skillInput.skillDefinitionId,
          status: boosted.status,
          progress: boosted.progress,
          bestStatus: boosted.bestStatus,
          trainedCount: boosted.trainedCount,
          firstTrainedAt: boosted.firstTrainedAt,
          lastTrainedAt: boosted.lastTrainedAt,
        },
        update: {
          status: boosted.status,
          progress: boosted.progress,
          bestStatus: boosted.bestStatus,
          trainedCount: boosted.trainedCount,
          firstTrainedAt: boosted.firstTrainedAt,
          lastTrainedAt: boosted.lastTrainedAt,
        },
      })
    }

    // Find the dog's system task
    const systemTask = await tx.task.findFirst({
      where: {
        categoryId: DOG_TRAINING_CATEGORY_ID,
        isSystem: true,
        dogId: data.dogId,
      },
    })

    let taskCompletionId: string | null = null
    if (systemTask) {
      const completion = await tx.taskCompletion.create({
        data: {
          taskId: systemTask.id,
          userId: user.id,
          points: pointsResult.points,
          withUserId: data.withUserId ?? null,
        },
      })
      taskCompletionId = completion.id
    }

    // Create DogTrainingSession with skills
    const session = await tx.dogTrainingSession.create({
      data: {
        dogId: data.dogId,
        userId: user.id,
        withUserId: data.withUserId ?? null,
        durationMinutes: data.durationMinutes,
        moodLevel: data.moodLevel ?? null,
        sessionType: data.sessionType ?? null,
        notes: data.notes ?? null,
        pointsAwarded: pointsResult.points,
        taskCompletionId,
        skillsTrained: {
          create: data.skills.map((s) => ({
            skillDefinitionId: s.skillDefinitionId,
            rating: s.rating,
          })),
        },
      },
    })

    // Check achievements (stub for now)
    const newAchievements = await checkAndUnlockDogAchievements(tx, user.id, data.dogId)

    revalidatePath("/hunde")
    revalidatePath("/")
    revalidatePath(`/hunde/${data.dogId}`)

    return {
      session,
      pointsAwarded: pointsResult.points,
      capped: pointsResult.capped,
      newAchievements,
      levelUps,
    }
  })
}
