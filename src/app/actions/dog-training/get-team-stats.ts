"use server"

import { prisma } from "@/lib/prisma"

export async function getDogTeamStats(dogId: string) {
  const users = await prisma.user.findMany({ select: { id: true, name: true } })
  const sessions = await prisma.dogTrainingSession.findMany({
    where: { dogId },
    include: { skillsTrained: true },
  })

  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)

  return users.map((user) => {
    const userSessions = sessions.filter(
      (s) => s.userId === user.id || s.withUserId === user.id,
    )
    const thisMonth = userSessions.filter((s) => s.completedAt >= monthAgo).length
    const totalMinutes = userSessions.reduce((sum, s) => sum + s.durationMinutes, 0)

    const skillCounts: Record<string, number> = {}
    for (const s of userSessions) {
      for (const sk of s.skillsTrained) {
        skillCounts[sk.skillDefinitionId] =
          (skillCounts[sk.skillDefinitionId] ?? 0) + 1
      }
    }
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id)

    return {
      userId: user.id,
      userName: user.name,
      totalSessions: userSessions.length,
      thisMonthSessions: thisMonth,
      totalMinutes,
      topSkills,
    }
  })
}
