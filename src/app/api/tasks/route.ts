import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

const VALID_DAYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])

function isValidScheduleDays(value: string): boolean {
  const parts = value.split(',')
  return parts.length > 0 && parts.every((d) => VALID_DAYS.has(d.trim()))
}

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

  const permError = requirePermission(session.user.role, 'createTasks')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const body = await req.json()
  const { title, emoji, points, categoryId, isRecurring, recurringInterval, allowMultiple, dailyLimit, scheduleDays, scheduleTime } = body

  if (!title || !emoji || !points || !categoryId) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const parsedPoints = Number(points)
  if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
    return NextResponse.json({ error: 'Punkte müssen eine positive ganze Zahl sein' }, { status: 400 })
  }

  if (body.scheduleDays && !isValidScheduleDays(body.scheduleDays)) {
    return NextResponse.json({ error: 'Ungültige Wochentage' }, { status: 400 })
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
        scheduleDays: scheduleDays ?? null,
        scheduleTime: scheduleTime ?? null,
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
