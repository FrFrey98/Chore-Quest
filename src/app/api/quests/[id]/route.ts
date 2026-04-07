import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const quest = await prisma.quest.findUnique({
    where: { id },
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
  })

  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

  return NextResponse.json(quest)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roleError = requireRole(session.user.role, 'admin')
  if (roleError) return NextResponse.json({ error: roleError.error }, { status: roleError.status })

  const { id } = await params
  const body = await req.json()

  const quest = await prisma.quest.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.titleDe !== undefined && { titleDe: body.titleDe }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.descriptionDe !== undefined && { descriptionDe: body.descriptionDe }),
      ...(body.emoji !== undefined && { emoji: body.emoji }),
      ...(body.bonusPoints !== undefined && { bonusPoints: body.bonusPoints }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })

  return NextResponse.json(quest)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roleError = requireRole(session.user.role, 'admin')
  if (roleError) return NextResponse.json({ error: roleError.error }, { status: roleError.status })

  const { id } = await params

  await prisma.quest.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
