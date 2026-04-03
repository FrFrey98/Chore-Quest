import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.category.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      taskCount: c._count.tasks,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, emoji } = body as { name: string; emoji: string }

  if (!name || !emoji) {
    return NextResponse.json({ error: 'Name und Emoji sind Pflichtfelder' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), emoji: emoji.trim() },
  })

  return NextResponse.json(category, { status: 201 })
}
