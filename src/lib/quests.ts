import { prisma } from '@/lib/prisma'

/**
 * Check if completing a task advances any active quest for the user.
 * Returns completed quests (for bonus notification).
 */
export async function updateQuestProgress(
  userId: string,
  taskId: string
): Promise<Array<{ id: string; title: string; titleDe: string; emoji: string; bonusPoints: number }>> {
  const completedQuests: Array<{ id: string; title: string; titleDe: string; emoji: string; bonusPoints: number }> = []

  // Find all active, incomplete UserQuests for this user
  const userQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      completedAt: null,
      quest: { isActive: true },
    },
    include: {
      quest: {
        include: {
          steps: { orderBy: { stepOrder: 'asc' } },
        },
      },
      userQuestSteps: true,
    },
  })

  for (const uq of userQuests) {
    // Find the current step
    const currentStep = uq.quest.steps.find((s) => s.stepOrder === uq.currentStepOrder)
    if (!currentStep) continue

    // Check if the completed task matches the current step's task
    if (currentStep.taskId !== taskId) continue

    // Find the corresponding UserQuestStep
    const userQuestStep = uq.userQuestSteps.find((uqs) => uqs.questStepId === currentStep.id)
    if (!userQuestStep || userQuestStep.completedAt) continue

    const isLastStep = uq.currentStepOrder >= uq.quest.steps.length

    if (isLastStep) {
      // Complete the quest
      await prisma.$transaction([
        prisma.userQuestStep.update({
          where: { id: userQuestStep.id },
          data: { completedAt: new Date() },
        }),
        prisma.userQuest.update({
          where: { id: uq.id },
          data: { completedAt: new Date() },
        }),
      ])

      completedQuests.push({
        id: uq.quest.id,
        title: uq.quest.title,
        titleDe: uq.quest.titleDe,
        emoji: uq.quest.emoji,
        bonusPoints: uq.quest.bonusPoints,
      })
    } else {
      // Advance to next step
      await prisma.$transaction([
        prisma.userQuestStep.update({
          where: { id: userQuestStep.id },
          data: { completedAt: new Date() },
        }),
        prisma.userQuest.update({
          where: { id: uq.id },
          data: { currentStepOrder: uq.currentStepOrder + 1 },
        }),
      ])
    }
  }

  return completedQuests
}
