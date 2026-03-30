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
  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      title: body.title,
      emoji: body.emoji,
      points: body.points !== undefined ? Number(body.points) : undefined,
      categoryId: body.categoryId,
      isRecurring: body.isRecurring,
      recurringInterval: body.recurringInterval ?? null,
    },
  })
  return NextResponse.json(task)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.task.update({
    where: { id: params.id },
    data: { status: 'archived' },
  })
  return new NextResponse(null, { status: 204 })
}
