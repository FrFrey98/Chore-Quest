import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pin, currentPin } = await req.json() as { pin?: string; currentPin?: string }

  if (!pin || typeof pin !== 'string' || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN muss 4–8 Ziffern haben' }, { status: 400 })
  }

  const isOwnPin = params.id === session.user.id
  const isAdmin = session.user.role === 'admin'

  // Must be own PIN or an admin
  if (!isOwnPin && !isAdmin) {
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
  }

  // Non-admin changing their own PIN must provide currentPin
  if (isOwnPin && !isAdmin) {
    if (!currentPin || typeof currentPin !== 'string') {
      return NextResponse.json({ error: 'Aktueller PIN erforderlich' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    const valid = await bcrypt.compare(currentPin, user.pin)
    if (!valid) return NextResponse.json({ error: 'Aktueller PIN ist falsch' }, { status: 403 })
  }

  const hashed = await bcrypt.hash(pin, 10)
  await prisma.user.update({ where: { id: params.id }, data: { pin: hashed } })
  return NextResponse.json({ success: true })
}
