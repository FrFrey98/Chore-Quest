import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const achievements = await prisma.achievement.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(achievements)
}

export async function POST(req: NextRequest) {
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
    title: string
    description: string
    emoji: string
    conditionType: string
    conditionValue: number
    conditionMeta?: string
    sortOrder?: number
  }

  // Validate required string fields
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'title ist ein Pflichtfeld' }, { status: 400 })
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json({ error: 'description ist ein Pflichtfeld' }, { status: 400 })
  }
  if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
    return NextResponse.json({ error: 'emoji ist ein Pflichtfeld' }, { status: 400 })
  }
  if (!conditionType || typeof conditionType !== 'string') {
    return NextResponse.json({ error: 'conditionType ist ein Pflichtfeld' }, { status: 400 })
  }
  if (conditionValue == null || isNaN(Number(conditionValue)) || Number(conditionValue) < 0) {
    return NextResponse.json({ error: 'conditionValue muss eine nicht-negative Zahl sein' }, { status: 400 })
  }

  const validTypes = ['task_count', 'category_count', 'streak_days', 'total_points', 'level']
  if (!validTypes.includes(conditionType)) {
    return NextResponse.json({ error: `conditionType muss einer von: ${validTypes.join(', ')}` }, { status: 400 })
  }

  const achievement = await prisma.achievement.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      emoji: emoji.trim(),
      conditionType,
      conditionValue: Number(conditionValue),
      conditionMeta: conditionMeta?.trim() || null,
      sortOrder: sortOrder ?? 0,
    },
  })

  return NextResponse.json(achievement, { status: 201 })
}
