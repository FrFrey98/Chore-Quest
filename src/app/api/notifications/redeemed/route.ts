import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const redeemed = await prisma.purchase.findMany({
    where: {
      userId: { not: session.user.id },
      redeemedAt: { not: null },
      notifiedAt: null,
    },
    include: {
      user: { select: { name: true } },
      item: { select: { title: true, emoji: true } },
    },
  })

  return NextResponse.json(redeemed.map((p) => ({
    id: p.id,
    userName: p.user.name,
    itemTitle: p.item.title,
    itemEmoji: p.item.emoji,
  })))
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })

  await prisma.purchase.updateMany({
    where: { id: { in: ids }, notifiedAt: null },
    data: { notifiedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
