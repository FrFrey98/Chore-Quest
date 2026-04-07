import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseBody } from '@/lib/validate'
import { updateTaskSchema } from '@/lib/schemas/task'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = await parseBody(req, updateTaskSchema)
  if (!parsed.success) return parsed.response

  const { assignedUserIds, ...updateFields } = parsed.data

  try {
    const task = await prisma.task.update({
      where: { id: id },
      data: {
        title: updateFields.title,
        emoji: updateFields.emoji,
        points: updateFields.points,
        categoryId: updateFields.categoryId,
        isRecurring: updateFields.isRecurring,
        recurringInterval: updateFields.recurringInterval ?? null,
        allowMultiple: updateFields.allowMultiple,
        dailyLimit: updateFields.allowMultiple === false ? null : updateFields.dailyLimit,
        scheduleDays: updateFields.scheduleDays !== undefined ? (updateFields.scheduleDays || null) : undefined,
        scheduleTime: updateFields.scheduleTime !== undefined ? (updateFields.scheduleTime || null) : undefined,
        ...(updateFields.decayHours !== undefined ? { decayHours: updateFields.decayHours } : {}),
        ...(updateFields.status !== undefined ? { status: updateFields.status } : {}),
        ...(assignedUserIds !== undefined ? {
          assignedUsers: { set: assignedUserIds.map((id: string) => ({ id })) },
        } : {}),
      },
    })
    return NextResponse.json(task)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.task.update({
      where: { id: id },
      data: { status: 'archived' },
    })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    throw error
  }
  return new NextResponse(null, { status: 204 })
}
