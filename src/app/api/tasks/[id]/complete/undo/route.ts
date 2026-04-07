import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recalculateStreak } from '@/lib/streak'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }
  const { completionId } = body

  if (!completionId || typeof completionId !== 'string') {
    return NextResponse.json({ error: 'completionId erforderlich' }, { status: 400 })
  }

  const completion = await prisma.taskCompletion.findUnique({
    where: { id: completionId },
  })

  if (!completion) {
    return NextResponse.json({ error: 'Erledigung nicht gefunden' }, { status: 404 })
  }

  if (completion.userId !== session.user.id) {
    return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }

  // Can only be undone until end of next calendar day (UTC)
  const completionDay = new Date(completion.completedAt)
  completionDay.setUTCHours(0, 0, 0, 0)
  const deadline = new Date(completionDay)
  deadline.setUTCDate(deadline.getUTCDate() + 2) // midnight after next day
  if (new Date() >= deadline) {
    return NextResponse.json({ error: 'Zeitfenster abgelaufen' }, { status: 410 })
  }

  await prisma.$transaction(async (tx) => {
    // Delete this completion
    await tx.taskCompletion.delete({ where: { id: completionId } })

    // If shared, also delete the partner's completion
    if (completion.withUserId) {
      const partnerCompletion = await tx.taskCompletion.findFirst({
        where: {
          taskId: completion.taskId,
          userId: completion.withUserId,
          withUserId: completion.userId,
          completedAt: {
            gte: new Date(completion.completedAt.getTime() - 5000),
            lte: new Date(completion.completedAt.getTime() + 5000),
          },
        },
      })
      if (partnerCompletion) {
        await tx.taskCompletion.delete({ where: { id: partnerCompletion.id } })
      }
    }

    const task = await tx.task.findUnique({ where: { id } })
    if (task) {
      if (task.isRecurring && task.recurringInterval) {
        // Recurring task: reset nextDueAt to now (immediately visible again)
        await tx.task.update({ where: { id }, data: { nextDueAt: new Date() } })
      } else if (task.status === 'archived') {
        // One-time task: revert to active
        await tx.task.update({ where: { id }, data: { status: 'active' } })
      }
    }
  })

  // Recalculate streak for the user (and partner if shared)
  await recalculateStreak(completion.userId)
  if (completion.withUserId) {
    await recalculateStreak(completion.withUserId)
  }

  return NextResponse.json({ success: true })
}
