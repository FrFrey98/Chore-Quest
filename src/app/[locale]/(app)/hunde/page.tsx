import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDogOverview } from "@/app/actions/dog-training/get-overview"
import { getDailyChallenge } from "@/app/actions/dog-training/get-daily-challenge"
import { DogsClient } from "./dogs-client"

export default async function HundePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const cfg = await prisma.appConfig.findUnique({ where: { key: "dog_training_enabled" } })
  if (cfg?.value !== "true") redirect("/")

  const dogs = await prisma.dog.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
  })

  const activeDogId = dogs[0]?.id ?? null
  const overview = activeDogId ? await getDogOverview(activeDogId) : null
  const dailyChallenge = activeDogId ? await getDailyChallenge(activeDogId) : null

  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(); dayEnd.setHours(23, 59, 59, 999)

  const [users, allSkills, categories, todayPointsAgg] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.dogSkillDefinition.findMany({
      orderBy: { sortOrder: "asc" },
      include: { category: { select: { nameDe: true } } },
    }),
    prisma.dogSkillCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    activeDogId
      ? prisma.dogTrainingSession.aggregate({
          where: { dogId: activeDogId, completedAt: { gte: dayStart, lte: dayEnd } },
          _sum: { pointsAwarded: true },
        })
      : Promise.resolve(null),
  ])

  const pointsEarnedTodayForDog = todayPointsAgg?._sum?.pointsAwarded ?? 0

  return (
    <DogsClient
      dogs={dogs.map((d) => ({
        id: d.id,
        name: d.name,
        emoji: d.emoji,
        photoBase64: d.photoBase64,
        breed: d.breed,
        gender: d.gender,
        birthDate: d.birthDate,
        phase: d.phase,
        notes: d.notes,
      }))}
      initialActiveDogId={activeDogId}
      initialOverview={overview}
      initialDailyChallenge={dailyChallenge}
      householdUsers={users}
      allSkills={allSkills.map((s) => ({
        id: s.id,
        nameDe: s.nameDe,
        nameEn: s.nameEn,
        categoryId: s.categoryId,
        categoryNameDe: s.category.nameDe,
        difficulty: s.difficulty,
      }))}
      dogTrainingCategories={categories.map((c) => ({
        id: c.id,
        nameDe: c.nameDe,
        nameEn: c.nameEn,
      }))}
      currentUserId={user.id}
      pointsEarnedTodayForDog={pointsEarnedTodayForDog}
    />
  )
}
