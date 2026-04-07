import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const quests = await prisma.quest.findMany({
    where: { isActive: true },
    include: {
      steps: {
        include: { task: { select: { id: true, title: true, emoji: true } } },
        orderBy: { stepOrder: 'asc' },
      },
      userQuests: {
        where: { userId: session.user.id },
        include: {
          userQuestSteps: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(quests)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roleError = requireRole(session.user.role, 'admin')
  if (roleError) return NextResponse.json({ error: roleError.error }, { status: roleError.status })

  const body = await req.json()
  const { title, titleDe, description, descriptionDe, emoji, bonusPoints, steps } = body

  if (!title || !titleDe || !description || !descriptionDe || !emoji || bonusPoints == null || !Array.isArray(steps) || steps.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const quest = await prisma.quest.create({
    data: {
      title,
      titleDe,
      description,
      descriptionDe,
      emoji,
      bonusPoints,
      createdById: session.user.id,
      steps: {
        create: steps.map((step: { taskId: string; description: string; descriptionDe: string }, index: number) => ({
          stepOrder: index + 1,
          taskId: step.taskId,
          description: step.description,
          descriptionDe: step.descriptionDe,
        })),
      },
    },
    include: {
      steps: {
        include: { task: { select: { id: true, title: true, emoji: true } } },
        orderBy: { stepOrder: 'asc' },
      },
    },
  })

  return NextResponse.json(quest, { status: 201 })
}
