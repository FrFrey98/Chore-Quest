import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.storeItem.findMany({
    where: { isActive: true },
    orderBy: { pointCost: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, emoji, pointCost, type, description, isActive } = body

  if (!title || !emoji || !pointCost || !type) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  if (typeof title !== 'string' || typeof emoji !== 'string') {
    return NextResponse.json({ error: 'Ungültige Felder' }, { status: 400 })
  }

  const parsedPointCost = Number(pointCost)
  if (!Number.isInteger(parsedPointCost) || parsedPointCost <= 0) {
    return NextResponse.json({ error: 'pointCost muss eine positive ganze Zahl sein' }, { status: 400 })
  }

  if (type !== 'trophy' && type !== 'real_reward') {
    return NextResponse.json({ error: 'type muss "trophy" oder "real_reward" sein' }, { status: 400 })
  }

  const item = await prisma.storeItem.create({
    data: {
      title,
      emoji,
      pointCost: parsedPointCost,
      type,
      description: typeof description === 'string' ? description : '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
