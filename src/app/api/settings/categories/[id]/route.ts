import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { parseBody } from '@/lib/validate'
import { updateCategorySchema } from '@/lib/schemas/category'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const parsed = await parseBody(req, updateCategorySchema)
  if (!parsed.success) return parsed.response

  const category = await prisma.category.findUnique({ where: { id: id } })
  if (!category) {
    return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
  }

  const updated = await prisma.category.update({
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

  const category = await prisma.category.findUnique({ where: { id: id } })
  if (!category) {
    return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
  }

  const taskCount = await prisma.task.count({ where: { categoryId: id } })
  if (taskCount > 0) {
    return NextResponse.json(
      { error: `Kategorie hat noch ${taskCount} zugeordnete Tasks. Erst Tasks umziehen oder archivieren.` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id: id } })
  return NextResponse.json({ success: true })
}
