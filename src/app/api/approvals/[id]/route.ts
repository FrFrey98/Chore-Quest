import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'approveTasks')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const { action } = await req.json()
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const approval = await prisma.taskApproval.findUnique({ where: { id: id } })
  if (!approval || approval.status !== 'pending') {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  // User cannot approve their own task
  if (approval.requestedById === session.user.id) {
    return NextResponse.json({ error: 'Cannot approve your own tasks' }, { status: 403 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.taskApproval.update({
      where: { id: id },
      data: { status: action === 'approve' ? 'approved' : 'rejected' },
    })
    await tx.task.update({
      where: { id: approval.taskId },
      data: {
        status: action === 'approve' ? 'active' : 'rejected',
        approvedById: action === 'approve' ? session.user.id : undefined,
      },
    })
  })

  return NextResponse.json({ success: true })
}
