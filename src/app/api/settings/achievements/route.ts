import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  if (!title || !description || !emoji || !conditionType || conditionValue == null) {
    return NextResponse.json({ error: 'Pflichtfelder: title, description, emoji, conditionType, conditionValue' }, { status: 400 })
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
