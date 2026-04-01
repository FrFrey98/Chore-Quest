import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.emoji === 'string') data.emoji = body.emoji
  if (typeof body.description === 'string') data.description = body.description
  if (body.pointCost !== undefined) {
    const cost = Number(body.pointCost)
    if (Number.isInteger(cost) && cost > 0) data.pointCost = cost
  }
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive

  try {
    const item = await prisma.storeItem.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(item)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Belohnung nicht gefunden' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.storeItem.update({
      where: { id: params.id },
      data: { isActive: false },
    })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Belohnung nicht gefunden' }, { status: 404 })
    }
    throw error
  }
  return new NextResponse(null, { status: 204 })
}
