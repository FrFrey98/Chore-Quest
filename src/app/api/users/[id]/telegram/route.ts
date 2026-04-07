import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'No permission' }, { status: 403 })
  }

  const code = randomBytes(4).toString('hex') // 8-char code

  // Store code -> userId mapping with 10-minute expiry
  const value = JSON.stringify({ userId: id, expiresAt: Date.now() + 600000 })
  await prisma.appConfig.upsert({
    where: { key: `telegram_link_${code}` },
    update: { value },
    create: { key: `telegram_link_${code}`, value },
  })

  return NextResponse.json({ code })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'No permission' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id },
    data: { telegramChatId: null },
  })

  return NextResponse.json({ success: true })
}
