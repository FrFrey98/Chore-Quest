import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseBody } from '@/lib/validate'
import { createStoreItemSchema } from '@/lib/schemas/store-item'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.storeItem.findMany({
    where: { isActive: true, type: 'real_reward' },
    orderBy: { pointCost: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = await parseBody(req, createStoreItemSchema)
  if (!parsed.success) return parsed.response
  const { title, emoji, description, pointCost, isActive } = parsed.data

  const item = await prisma.storeItem.create({
    data: {
      title,
      emoji,
      pointCost,
      type: 'real_reward',
      description,
      isActive,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
