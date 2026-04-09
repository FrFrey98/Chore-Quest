import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getDogOverview } from "@/app/actions/dog-training/get-overview"
import { SkillTreeView } from "@/components/dogs/skill-tree"

type PageProps = {
  params: Promise<{ dogId: string; categoryId: string }>
}

export default async function SkillTreePage({ params }: PageProps) {
  const { dogId, categoryId } = await params
  const overview = await getDogOverview(dogId)
  if (!overview) notFound()

  const pillar = overview.pillars.find((p: any) => p.category.id === categoryId)
  if (!pillar) notFound()

  const recentSessions = await prisma.dogTrainingSession.findMany({
    where: { dogId },
    orderBy: { completedAt: "desc" },
    take: 50,
    include: { skillsTrained: true },
  })

  return <SkillTreeView dog={overview.dog} pillar={pillar} recentSessions={recentSessions} />
}
