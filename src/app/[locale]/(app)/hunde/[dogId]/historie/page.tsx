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
  return <HistoryView dog={dog} sessions={sessions} teamStats={teamStats} />
}
