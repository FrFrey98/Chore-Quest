import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_DAYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])

function isValidScheduleDays(value: string): boolean {
  const parts = value.split(',')
  return parts.length > 0 && parts.every((d) => VALID_DAYS.has(d.trim()))
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { assignedUserIds, ...updateFields } = body
  const allowedStatuses = ['active', 'archived']

  if (body.scheduleDays && !isValidScheduleDays(body.scheduleDays)) {
    return NextResponse.json({ error: 'Ungültige Wochentage' }, { status: 400 })
  }

  try {
    const task = await prisma.task.update({
      where: { id: id },
      data: {
        title: updateFields.title,
        emoji: updateFields.emoji,
        points: updateFields.points !== undefined ? Number(updateFields.points) : undefined,
        categoryId: updateFields.categoryId,
        isRecurring: updateFields.isRecurring,
        recurringInterval: updateFields.recurringInterval ?? null,
        allowMultiple: updateFields.allowMultiple !== undefined ? Boolean(updateFields.allowMultiple) : undefined,
        dailyLimit: updateFields.allowMultiple === false ? null : (updateFields.dailyLimit !== undefined ? Number(updateFields.dailyLimit) : undefined),
        scheduleDays: updateFields.scheduleDays !== undefined ? (updateFields.scheduleDays || null) : undefined,
        scheduleTime: updateFields.scheduleTime !== undefined ? (updateFields.scheduleTime || null) : undefined,
        ...(typeof updateFields.status === 'string' && allowedStatuses.includes(updateFields.status)
          ? { status: updateFields.status }
          : {}),
        ...(assignedUserIds !== undefined ? {
          assignedUsers: { set: assignedUserIds.map((id: string) => ({ id })) },
        } : {}),
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
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
    }
    throw error
  }
  return new NextResponse(null, { status: 204 })
}
