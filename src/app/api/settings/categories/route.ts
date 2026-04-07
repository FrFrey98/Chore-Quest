import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { parseBody } from '@/lib/validate'
import { createCategorySchema } from '@/lib/schemas/category'

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

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const parsed = await parseBody(req, createCategorySchema)
  if (!parsed.success) return parsed.response
  const { name, emoji } = parsed.data

  const category = await prisma.category.create({
    data: { name, emoji },
  })

  return NextResponse.json(category, { status: 201 })
}
