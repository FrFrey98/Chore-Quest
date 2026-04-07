import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { parseBody } from '@/lib/validate'
import { createUserSchema } from '@/lib/schemas/user'

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

  const parsed = await parseBody(req, createUserSchema)
  if (!parsed.success) return parsed.response
  const { name, pin, role } = parsed.data

  // Check duplicate name (case-insensitive, SQLite-safe)
  const existing = await prisma.user.findMany({ select: { name: true } })
  if (existing.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: 'This name is already taken' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(pin, 10)

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name, pin: hashed, role },
      select: { id: true, name: true, role: true },
    })
    await tx.streakState.create({ data: { userId: created.id } })
    return created
  })

  return NextResponse.json(user, { status: 201 })
}
