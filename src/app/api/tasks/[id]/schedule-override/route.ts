import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { date, type } = body

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Ungültiges Datum' }, { status: 400 })
  }
  if (type !== 'add' && type !== 'skip') {
    return NextResponse.json({ error: 'Typ muss "add" oder "skip" sein' }, { status: 400 })
  }

  // Date must be in the future (not today, not past)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const overrideDate = new Date(date + 'T00:00:00.000Z')
  if (overrideDate <= todayStart) {
    return NextResponse.json({ error: 'Datum muss in der Zukunft liegen' }, { status: 400 })
  }

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.status !== 'active') {
    return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
  }
  if (!task.isRecurring) {
    return NextResponse.json({ error: 'Nur für wiederkehrende Aufgaben' }, { status: 400 })
  }

  const override = await prisma.taskScheduleOverride.upsert({
    where: { taskId_date: { taskId: id, date } },
    update: { type },
    create: { taskId: id, date, type },
  })

  return NextResponse.json(override, { status: 200 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { date } = body

  if (!date || typeof date !== 'string') {
    return NextResponse.json({ error: 'Datum erforderlich' }, { status: 400 })
  }

  try {
    await prisma.taskScheduleOverride.delete({
      where: { taskId_date: { taskId: id, date } },
    })
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    if (prismaError?.code === 'P2025') {
      return NextResponse.json({ error: 'Override nicht gefunden' }, { status: 404 })
    }
    throw error
  }

  return new NextResponse(null, { status: 204 })
}
