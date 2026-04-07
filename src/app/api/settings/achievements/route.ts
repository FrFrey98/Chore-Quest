import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { parseBody } from '@/lib/validate'
import { createAchievementSchema } from '@/lib/schemas/achievement'

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

  const parsed = await parseBody(req, createAchievementSchema)
  if (!parsed.success) return parsed.response
  const { title, description, emoji, conditionType, conditionValue, conditionMeta, sortOrder } = parsed.data

  const achievement = await prisma.achievement.create({
    data: {
      title,
      description,
      emoji,
      conditionType,
      conditionValue,
      conditionMeta,
      sortOrder,
    },
  })

  return NextResponse.json(achievement, { status: 201 })
}
