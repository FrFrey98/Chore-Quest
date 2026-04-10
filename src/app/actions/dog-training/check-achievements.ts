// src/app/actions/dog-training/check-achievements.ts
import { evaluateAchievementCondition } from "@/lib/dog-training/achievements"
import { calculatePillarHealth } from "@/lib/dog-training/pillar-health"
import type { SkillStatus } from "@/lib/dog-training/types"
import { SKILL_STATUSES } from "@/lib/dog-training/types"
import { Prisma } from "@/generated/prisma/client"
import type {
  DogTrainingSession,
  DogSkillProgress,
  DogSkillDefinition,
  DogAchievement,
  UserDogAchievement,
} from "@/generated/prisma/client"

type TxClient = Prisma.TransactionClient

export async function checkAndUnlockDogAchievements(
  tx: TxClient,
  userId: string,
  dogId: string,
) {
  const sessions: DogTrainingSession[] = await tx.dogTrainingSession.findMany({ where: { dogId } })
  const sessionCount = sessions.length
  const teamSessionCount = sessions.filter(
    (s) => s.withUserId === userId || (s.userId === userId && s.withUserId),
  ).length

  // training streak (consecutive days with at least 1 session for this dog)
  const dayStrings = new Set(
    sessions.map((s) => {
      const d = new Date(s.completedAt)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }),
  )
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (dayStrings.has(key)) {
      streak++
    } else {
      break
    }
  }

  // skill status counts (by bestStatus to respect Relearning Savings)
  const progresses: DogSkillProgress[] = await tx.dogSkillProgress.findMany({ where: { dogId } })
  const skillStatusCounts: Record<SkillStatus, number> = {
    new: 0,
    acquisition: 0,
    fluency: 0,
    proficiency: 0,
    maintenance: 0,
    mastery: 0,
  }
  for (const s of SKILL_STATUSES) {
    skillStatusCounts[s] = progresses.filter((p) => p.bestStatus === s).length
  }

  // pillar health per category
  const defs: DogSkillDefinition[] = await tx.dogSkillDefinition.findMany()
  const pillarHealth: Record<string, number> = {}
  const categoryIds: string[] = Array.from(new Set(defs.map((d) => d.categoryId)))
  for (const catId of categoryIds) {
    const catDefs = defs.filter((d) => d.categoryId === catId)
    const catProgresses = catDefs.map((d) => {
      const p = progresses.find((x) => x.skillDefinitionId === d.id)
      return {
        status: (p?.bestStatus ?? "new") as SkillStatus,
        progress: p?.progress ?? 0,
        trainedCount: p?.trainedCount ?? 0,
      }
    })
    pillarHealth[catId] = calculatePillarHealth(catProgresses)
  }

  // Evaluate achievements
  const achievements: DogAchievement[] = await tx.dogAchievement.findMany()
  const existing: UserDogAchievement[] = await tx.userDogAchievement.findMany({
    where: { userId, dogId },
  })
  const existingIds = new Set(existing.map((x) => x.achievementId))

  const newlyUnlocked: DogAchievement[] = []
  for (const ach of achievements) {
    if (existingIds.has(ach.id)) continue
    const match = evaluateAchievementCondition(
      {
        conditionType: ach.conditionType,
        conditionValue: ach.conditionValue,
        conditionMeta: ach.conditionMeta ?? null,
      },
      {
        sessionCount,
        teamSessionCount,
        trainingStreakDays: streak,
        skillStatusCounts,
        pillarHealth,
      },
    )
    if (match) {
      await tx.userDogAchievement.create({
        data: { userId, dogId, achievementId: ach.id },
      })
      newlyUnlocked.push(ach)
    }
  }
  return newlyUnlocked
}
