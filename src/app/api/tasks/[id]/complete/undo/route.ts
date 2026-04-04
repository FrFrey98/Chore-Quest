import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Can only be undone within 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  if (completion.completedAt < fiveMinutesAgo) {
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

    const task = await tx.task.findUnique({ where: { id: params.id } })
    if (task) {
      if (task.isRecurring && task.recurringInterval) {
        // Recurring task: reset nextDueAt to now (immediately visible again)
        await tx.task.update({ where: { id: params.id }, data: { nextDueAt: new Date() } })
      } else if (task.status === 'archived') {
        // One-time task: revert to active
        await tx.task.update({ where: { id: params.id }, data: { status: 'active' } })
      }
    }
  })

  return NextResponse.json({ success: true })
}
