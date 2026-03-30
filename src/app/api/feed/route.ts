import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const completions = await prisma.taskCompletion.findMany({
    take: 50,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { id: true, title: true, emoji: true } },
    },
  })

  const feed = completions.map((c) => ({
    id: c.id,
    type: 'completion' as const,
    user: c.user,
    task: c.task,
    points: c.points,
    at: c.completedAt,
  }))

  return NextResponse.json(feed)
}
