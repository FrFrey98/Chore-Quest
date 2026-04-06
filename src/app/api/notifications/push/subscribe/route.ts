import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPushConfigured } from '@/lib/push'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isPushConfigured()) {
    return NextResponse.json({ error: 'Push nicht konfiguriert' }, { status: 503 })
  }

  const body = await req.json()
  const { endpoint, p256dh, auth } = body as { endpoint?: string; p256dh?: string; auth?: string }

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'endpoint, p256dh und auth erforderlich' }, { status: 400 })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh,
      auth,
    },
    update: {
      userId: session.user.id,
      p256dh,
      auth,
    },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationsEnabled: true },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.pushSubscription.deleteMany({
    where: { userId: session.user.id },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationsEnabled: false },
  })

  return NextResponse.json({ success: true })
}
