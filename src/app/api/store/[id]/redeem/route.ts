import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    include: { item: { select: { type: true } } },
  })

  if (!purchase) {
    return NextResponse.json({ error: 'Kauf nicht gefunden' }, { status: 404 })
  }

  // Nur real_reward kann eingelöst werden
  if (purchase.item.type !== 'real_reward') {
    return NextResponse.json({ error: 'Trophäen werden nicht eingelöst' }, { status: 400 })
  }

  if (purchase.redeemedAt) {
    return NextResponse.json({ error: 'Bereits eingelöst' }, { status: 409 })
  }

  // Der Partner (nicht der Käufer) markiert als eingelöst
  if (purchase.userId === session.user.id) {
    return NextResponse.json({ error: 'Du kannst deine eigene Belohnung nicht einlösen — dein Partner muss das bestätigen' }, { status: 403 })
  }

  const updated = await prisma.purchase.update({
    where: { id: params.id },
    data: { redeemedAt: new Date() },
  })
  return NextResponse.json(updated)
}
