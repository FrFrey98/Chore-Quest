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
  const { name, notificationsEnabled, installPromptDismissed } = body as {
    name?: string
    notificationsEnabled?: boolean
    installPromptDismissed?: boolean
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })
    }
    data.name = name.trim()
  }

  if (typeof notificationsEnabled === 'boolean') {
    data.notificationsEnabled = notificationsEnabled
  }

  if (typeof installPromptDismissed === 'boolean') {
    data.installPromptDismissed = installPromptDismissed
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Keine Änderungen' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json({ id: updated.id, name: updated.name })
}
