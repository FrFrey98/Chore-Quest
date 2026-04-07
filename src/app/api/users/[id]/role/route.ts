import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'manageUsers')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  if (id === session.user.id) {
    return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })
  }

  const { role } = await req.json()

  if (!role || !['admin', 'member', 'child'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id } })
      if (!target) throw new Error('NOT_FOUND')
      if (target.role === 'admin' && role !== 'admin') {
        const adminCount = await tx.user.count({ where: { role: 'admin' } })
        if (adminCount <= 1) throw new Error('LAST_ADMIN')
      }
      await tx.user.update({ where: { id }, data: { role } })
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') return NextResponse.json({ error: 'User not found' }, { status: 404 })
      if (error.message === 'LAST_ADMIN') return NextResponse.json({ error: 'The last admin cannot be demoted' }, { status: 409 })
    }
    throw error
  }
}
