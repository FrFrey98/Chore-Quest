import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoalsClient } from './goals-client'

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const { tab } = await searchParams
  const initialTab: 'challenges' | 'quests' = tab === 'quests' ? 'quests' : 'challenges'

  const now = new Date()

  // ── Challenges data ───────────────────────────────────────────────────────
  const currentChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      challenge: {
        weekStart: { lte: now },
        weekEnd: { gte: now },
      },
    },
    include: { challenge: true },
    orderBy: { challenge: { createdAt: 'asc' } },
  })

  const eightWeeksAgo = new Date(now)
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  const historicalChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      challenge: {
        weekEnd: { lt: now },
        weekStart: { gte: eightWeeksAgo },
      },
    },
    include: { challenge: true },
    orderBy: { challenge: { weekStart: 'desc' } },
  })

  const serializeChallenge = (uc: typeof currentChallenges[number]) => ({
    id: uc.id,
    currentProgress: uc.currentProgress,
    completedAt: uc.completedAt?.toISOString() ?? null,
    challenge: {
      id: uc.challenge.id,
      emoji: uc.challenge.emoji,
      title: uc.challenge.title,
      titleDe: uc.challenge.titleDe,
      description: uc.challenge.description,
      descriptionDe: uc.challenge.descriptionDe,
      targetValue: uc.challenge.targetValue,
      bonusPoints: uc.challenge.bonusPoints,
      weekStart: uc.challenge.weekStart.toISOString(),
      weekEnd: uc.challenge.weekEnd.toISOString(),
    },
  })

  // ── Quests data ───────────────────────────────────────────────────────────
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

  const serializedQuests = quests.map((q) => {
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

  return (
    <GoalsClient
      initialTab={initialTab}
      challengesProps={{
        current: currentChallenges.map(serializeChallenge),
        history: historicalChallenges.map(serializeChallenge),
      }}
      questsProps={{ quests: serializedQuests }}
    />
  )
}
