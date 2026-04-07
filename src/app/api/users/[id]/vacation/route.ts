import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Start or update vacation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  // Users can set their own vacation, admins can set for anyone
  if (session.user.id !== id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No permission' }, { status: 403 })
  }

  const body = await req.json()
  const { endDate } = body // optional ISO string or null

  const now = new Date()

  await prisma.user.update({
    where: { id },
    data: {
      vacationStart: now,
      vacationEnd: endDate ? new Date(endDate) : null,
    },
  })

  return NextResponse.json({ vacationStart: now.toISOString(), vacationEnd: endDate || null })
}

// End vacation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (session.user.id !== id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No permission' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id },
    data: {
      vacationStart: null,
      vacationEnd: null,
    },
  })

  return NextResponse.json({ vacationStart: null, vacationEnd: null })
}
