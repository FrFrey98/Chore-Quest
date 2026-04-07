import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QuestsClient } from './quests-client'

export default async function QuestsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const quests = await prisma.quest.findMany({
    where: { isActive: true },
    include: {
      steps: {
        include: { task: { select: { id: true, title: true, emoji: true } } },
        orderBy: { stepOrder: 'asc' },
      },
      userQuests: {
        where: { userId },
        include: {
          userQuestSteps: {
            include: { questStep: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = quests.map((q) => {
    const userQuest = q.userQuests[0] ?? null
    return {
      id: q.id,
      title: q.title,
      titleDe: q.titleDe,
      description: q.description,
      descriptionDe: q.descriptionDe,
      emoji: q.emoji,
      bonusPoints: q.bonusPoints,
      steps: q.steps.map((s) => ({
        id: s.id,
        stepOrder: s.stepOrder,
        description: s.description,
        descriptionDe: s.descriptionDe,
        task: s.task,
      })),
      userQuest: userQuest
        ? {
            id: userQuest.id,
            currentStepOrder: userQuest.currentStepOrder,
            startedAt: userQuest.startedAt.toISOString(),
            completedAt: userQuest.completedAt?.toISOString() ?? null,
            completedStepIds: userQuest.userQuestSteps
              .filter((uqs) => uqs.completedAt !== null)
              .map((uqs) => uqs.questStep.id),
          }
        : null,
    }
  })

  return <QuestsClient quests={serialized} />
}
