import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'manageUsers')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const body = await req.json()
  const { name, pin, role } = body as { name?: string; pin?: string; role?: string }

  // Validate name
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return NextResponse.json({ error: 'Name muss zwischen 2 und 50 Zeichen lang sein' }, { status: 400 })
  }

  // Validate PIN
  if (!pin || typeof pin !== 'string' || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN muss 4–8 Ziffern haben' }, { status: 400 })
  }

  // Validate role
  if (!role || !['admin', 'member', 'child'].includes(role)) {
    return NextResponse.json({ error: 'Ungültige Rolle' }, { status: 400 })
  }

  // Check duplicate name (case-insensitive, SQLite-safe)
  const existing = await prisma.user.findMany({ select: { name: true } })
  if (existing.some(u => u.name.toLowerCase() === trimmedName.toLowerCase())) {
    return NextResponse.json({ error: 'Dieser Name ist bereits vergeben' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(pin, 10)

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: trimmedName, pin: hashed, role: role as 'admin' | 'member' | 'child' },
      select: { id: true, name: true, role: true },
    })
    await tx.streakState.create({ data: { userId: created.id } })
    return created
  })

  return NextResponse.json(user, { status: 201 })
}
