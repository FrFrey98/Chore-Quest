import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const count = await prisma.taskApproval.count({
    where: {
      status: 'pending',
      requestedById: { not: session.user.id },
    },
  })
  return NextResponse.json({ count })
}
