import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, emoji } = body as { name?: string; emoji?: string }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })
  }
  if (emoji !== undefined && (typeof emoji !== 'string' || emoji.trim().length === 0)) {
    return NextResponse.json({ error: 'Emoji darf nicht leer sein' }, { status: 400 })
  }

  const category = await prisma.category.findUnique({ where: { id: params.id } })
  if (!category) {
    return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(emoji !== undefined ? { emoji: emoji.trim() } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const category = await prisma.category.findUnique({ where: { id: params.id } })
  if (!category) {
    return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
  }

  const taskCount = await prisma.task.count({ where: { categoryId: params.id } })
  if (taskCount > 0) {
    return NextResponse.json(
      { error: `Kategorie hat noch ${taskCount} zugeordnete Tasks. Erst Tasks umziehen oder archivieren.` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
