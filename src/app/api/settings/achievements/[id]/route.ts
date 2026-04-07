import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, description, emoji, conditionType, conditionValue, conditionMeta, sortOrder } = body as {
    title?: string
    description?: string
    emoji?: string
    conditionType?: string
    conditionValue?: number
    conditionMeta?: string | null
    sortOrder?: number
  }

  const achievement = await prisma.achievement.findUnique({ where: { id: id } })
  if (!achievement) {
    return NextResponse.json({ error: 'Achievement nicht gefunden' }, { status: 404 })
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return NextResponse.json({ error: 'title darf nicht leer sein' }, { status: 400 })
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    return NextResponse.json({ error: 'description darf nicht leer sein' }, { status: 400 })
  }
  if (emoji !== undefined && (typeof emoji !== 'string' || emoji.trim().length === 0)) {
    return NextResponse.json({ error: 'emoji darf nicht leer sein' }, { status: 400 })
  }
  if (conditionValue !== undefined && (isNaN(Number(conditionValue)) || Number(conditionValue) < 0)) {
    return NextResponse.json({ error: 'conditionValue muss eine nicht-negative Zahl sein' }, { status: 400 })
  }

  if (conditionType !== undefined) {
    const validTypes = ['task_count', 'category_count', 'streak_days', 'total_points', 'level']
    if (typeof conditionType !== 'string' || !validTypes.includes(conditionType)) {
      return NextResponse.json({ error: `conditionType muss einer von: ${validTypes.join(', ')}` }, { status: 400 })
    }
  }

  const updated = await prisma.achievement.update({
    where: { id: id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(emoji !== undefined ? { emoji: emoji.trim() } : {}),
      ...(conditionType !== undefined ? { conditionType } : {}),
      ...(conditionValue !== undefined ? { conditionValue: Number(conditionValue) } : {}),
      ...(conditionMeta !== undefined ? { conditionMeta: conditionMeta?.trim() || null } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const achievement = await prisma.achievement.findUnique({ where: { id: id } })
  if (!achievement) {
    return NextResponse.json({ error: 'Achievement nicht gefunden' }, { status: 404 })
  }

  // Delete cascades to UserAchievements via onDelete: Cascade in schema
  await prisma.achievement.delete({ where: { id: id } })
  return NextResponse.json({ success: true })
}
