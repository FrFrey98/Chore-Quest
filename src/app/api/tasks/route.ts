import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { parseBody } from '@/lib/validate'
import { createTaskSchema } from '@/lib/schemas/task'

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

  const parsed = await parseBody(req, createTaskSchema)
  if (!parsed.success) return parsed.response
  const { title, emoji, points, categoryId, isRecurring, recurringInterval, allowMultiple, dailyLimit, scheduleDays, scheduleTime, assignedUserIds } = parsed.data

  const { task } = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title,
        emoji,
        points,
        categoryId,
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : null,
        allowMultiple,
        dailyLimit: allowMultiple && dailyLimit ? dailyLimit : null,
        scheduleDays: scheduleDays ?? null,
        scheduleTime: scheduleTime ?? null,
        status: 'pending_approval',
        createdById: session.user.id,
        ...(assignedUserIds?.length ? {
          assignedUsers: { connect: assignedUserIds.map((id: string) => ({ id })) },
        } : {}),
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
