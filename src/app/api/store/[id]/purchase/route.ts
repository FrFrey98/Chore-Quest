import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentPoints, getTotalEarned } from '@/lib/points'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.storeItem.findUnique({ where: { id } })
  if (!item || !item.isActive) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  try {
    const purchase = await prisma.$transaction(async (tx) => {
      // Re-check points balance inside transaction
      const [completions, purchases, completedChallenges] = await Promise.all([
        tx.taskCompletion.findMany({
          where: { userId: session.user.id },
          select: { points: true },
        }),
        tx.purchase.findMany({
          where: { userId: session.user.id },
          select: { pointsSpent: true },
        }),
        tx.userChallenge.findMany({
          where: { userId: session.user.id, completedAt: { not: null } },
          include: { challenge: { select: { bonusPoints: true } } },
        }),
      ])
      const challengeBonus = completedChallenges.reduce((s, uc) => s + uc.challenge.bonusPoints, 0)
      const earned = getTotalEarned(completions) + challengeBonus
      const spent = purchases.reduce((s, p) => s + p.pointsSpent, 0)
      const balance = getCurrentPoints(earned, spent)

      if (balance < item.pointCost) {
        throw new Error('INSUFFICIENT_POINTS')
      }

      return tx.purchase.create({
        data: { itemId: id, userId: session.user.id, pointsSpent: item.pointCost },
      })
    })
    return NextResponse.json(purchase, { status: 201 })
  } catch (e) {
    if (e instanceof Error && e.message === 'INSUFFICIENT_POINTS') {
      return NextResponse.json({ error: 'Not enough points' }, { status: 402 })
    }
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
