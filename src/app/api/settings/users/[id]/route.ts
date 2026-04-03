import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name } = body as { name: string }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { name: name.trim() },
  })

  return NextResponse.json({ id: updated.id, name: updated.name })
}
