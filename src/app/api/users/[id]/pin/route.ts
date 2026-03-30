import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pin } = await req.json()
  if (!pin || typeof pin !== 'string' || pin.length < 4) {
    return NextResponse.json({ error: 'PIN muss mindestens 4 Zeichen haben' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(pin, 10)
  await prisma.user.update({ where: { id: params.id }, data: { pin: hashed } })
  return NextResponse.json({ success: true })
}
