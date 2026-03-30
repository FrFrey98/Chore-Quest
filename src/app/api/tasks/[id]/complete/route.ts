import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextDueAt } from '@/lib/recurring'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task || task.status !== 'active') {
    return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
  }

  const completion = await prisma.taskCompletion.create({
    data: { taskId: task.id, userId: session.user.id, points: task.points },
  })

  if (task.isRecurring && task.recurringInterval) {
    const nextDueAt = getNextDueAt(task.recurringInterval, new Date())
    await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
  } else {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'archived' },
    })
  }

  return NextResponse.json(completion, { status: 201 })
}
