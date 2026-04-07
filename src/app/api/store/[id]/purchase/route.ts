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
    return NextResponse.json({ error: 'Artikel nicht gefunden' }, { status: 404 })
  }

  try {
    const purchase = await prisma.$transaction(async (tx) => {
      // Re-check points balance inside transaction
      const completions = await tx.taskCompletion.findMany({
        where: { userId: session.user.id },
        select: { points: true },
      })
      const purchases = await tx.purchase.findMany({
        where: { userId: session.user.id },
        select: { pointsSpent: true },
      })
      const earned = getTotalEarned(completions)
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
      return NextResponse.json({ error: 'Nicht genug Punkte' }, { status: 402 })
    }
    return NextResponse.json({ error: 'Fehler beim Kauf' }, { status: 500 })
  }
}
