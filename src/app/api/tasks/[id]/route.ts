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
  try {
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
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
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
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'archived' },
    })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
    }
    throw error
  }
  return new NextResponse(null, { status: 204 })
}
