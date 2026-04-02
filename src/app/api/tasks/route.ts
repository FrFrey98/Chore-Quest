import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const tasks = await prisma.task.findMany({
    where: { status: 'active' },
    include: { category: true, createdBy: { select: { id: true, name: true } } },
    orderBy: { points: 'desc' },
  })

  const visible = tasks.filter(
    (t) => !t.isRecurring || !t.nextDueAt || t.nextDueAt <= now
  )

  return NextResponse.json(visible)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, emoji, points, categoryId, isRecurring, recurringInterval, allowMultiple, dailyLimit } = body

  if (!title || !emoji || !points || !categoryId) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const parsedPoints = Number(points)
  if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
    return NextResponse.json({ error: 'Punkte müssen eine positive ganze Zahl sein' }, { status: 400 })
  }

  const { task } = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title,
        emoji,
        points: parsedPoints,
        categoryId,
        isRecurring: Boolean(isRecurring),
        recurringInterval: isRecurring ? recurringInterval : null,
        allowMultiple: Boolean(allowMultiple),
        dailyLimit: allowMultiple && dailyLimit ? Number(dailyLimit) : null,
        status: 'pending_approval',
        createdById: session.user.id,
      },
    })

    await tx.taskApproval.create({
      data: {
        taskId: task.id,
        requestedById: session.user.id,
        status: 'pending',
      },
    })

    return { task }
  })

  return NextResponse.json(task, { status: 201 })
}
