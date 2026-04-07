import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = session.user.id

  const quest = await prisma.quest.findUnique({
    where: { id },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  })

  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  if (!quest.isActive) return NextResponse.json({ error: 'Quest is not active' }, { status: 400 })
  if (quest.steps.length === 0) return NextResponse.json({ error: 'Quest has no steps' }, { status: 400 })

  try {
    const userQuest = await prisma.userQuest.create({
      data: {
        userId,
        questId: id,
        currentStepOrder: 1,
        userQuestSteps: {
          create: quest.steps.map((step) => ({
            questStepId: step.id,
          })),
        },
      },
      include: {
        userQuestSteps: true,
      },
    })

    return NextResponse.json(userQuest, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Quest already accepted' }, { status: 400 })
    }
    throw err
  }
}
