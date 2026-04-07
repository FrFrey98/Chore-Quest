import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { parseBody } from '@/lib/validate'
import { updateAchievementSchema } from '@/lib/schemas/achievement'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const parsed = await parseBody(req, updateAchievementSchema)
  if (!parsed.success) return parsed.response

  const achievement = await prisma.achievement.findUnique({ where: { id: id } })
  if (!achievement) {
    return NextResponse.json({ error: 'Achievement nicht gefunden' }, { status: 404 })
  }

  const updated = await prisma.achievement.update({
    where: { id: id },
    data: parsed.data,
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
