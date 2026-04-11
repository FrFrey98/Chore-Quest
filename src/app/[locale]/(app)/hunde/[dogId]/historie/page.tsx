import { getDogSessionHistory } from "@/app/actions/dog-training/get-history"
import { getDogTeamStats } from "@/app/actions/dog-training/get-team-stats"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { HistoryView } from "@/components/dogs/history-view"

type PageProps = {
  params: Promise<{ dogId: string }>
}

export default async function HistoryPage({ params }: PageProps) {
  const { dogId } = await params
  const dog = await prisma.dog.findUnique({ where: { id: dogId } })
  if (!dog) notFound()
  const sessions = await getDogSessionHistory(dogId, 30)
  const teamStats = await getDogTeamStats(dogId)

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const sessionsByDay = await prisma.dogTrainingSession.findMany({
    where: { dogId, completedAt: { gte: ninetyDaysAgo } },
    select: { completedAt: true, pointsAwarded: true },
  })

  const sessionCounts: Record<string, number> = {}
  for (const s of sessionsByDay) {
    const d = s.completedAt
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    sessionCounts[key] = (sessionCounts[key] ?? 0) + 1
  }

  // Weekly points for last 12 weeks
  const weeklyPoints: Array<{ weekLabel: string; points: number }> = []
  for (let w = 11; w >= 0; w--) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - w * 7 - weekStart.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const pts = sessionsByDay
      .filter((s) => s.completedAt >= weekStart && s.completedAt < weekEnd)
      .reduce((sum, s) => sum + s.pointsAwarded, 0)

    const weekNum = Math.ceil((weekStart.getDate() + new Date(weekStart.getFullYear(), weekStart.getMonth(), 0).getDate()) / 7)
    weeklyPoints.push({ weekLabel: `KW${weekNum}`, points: pts })
  }

  return <HistoryView dog={dog} sessions={sessions} teamStats={teamStats} sessionCounts={sessionCounts} weeklyPoints={weeklyPoints} />
}
