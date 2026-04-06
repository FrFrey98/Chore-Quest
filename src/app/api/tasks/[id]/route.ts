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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowedStatuses = ['active', 'archived']

  if (body.scheduleDays && !isValidScheduleDays(body.scheduleDays)) {
    return NextResponse.json({ error: 'Ungültige Wochentage' }, { status: 400 })
  }

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
        allowMultiple: body.allowMultiple !== undefined ? Boolean(body.allowMultiple) : undefined,
        dailyLimit: body.allowMultiple === false ? null : (body.dailyLimit !== undefined ? Number(body.dailyLimit) : undefined),
        scheduleDays: body.scheduleDays !== undefined ? (body.scheduleDays || null) : undefined,
        scheduleTime: body.scheduleTime !== undefined ? (body.scheduleTime || null) : undefined,
        ...(typeof body.status === 'string' && allowedStatuses.includes(body.status)
          ? { status: body.status }
          : {}),
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
