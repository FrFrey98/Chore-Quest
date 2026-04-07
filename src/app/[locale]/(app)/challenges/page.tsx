import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChallengesClient } from './challenges-client'

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const now = new Date()

  // Current week's challenges
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

  // Historical challenges (past 8 weeks)
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

  const serialize = (uc: typeof currentChallenges[number]) => ({
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

  return (
    <ChallengesClient
      current={currentChallenges.map(serialize)}
      history={historicalChallenges.map(serialize)}
    />
  )
}
