import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'manageUsers')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })

  // Prevent deleting the last admin
  if (target.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Der letzte Admin kann nicht gelöscht werden' }, { status: 409 })
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.pushSubscription.deleteMany({ where: { userId: params.id } })
    await tx.streakState.deleteMany({ where: { userId: params.id } })
    await tx.userAchievement.deleteMany({ where: { userId: params.id } })
    await tx.taskApproval.deleteMany({ where: { requestedById: params.id } })
    await tx.user.delete({ where: { id: params.id } })
  })

  return NextResponse.json({ success: true })
}
