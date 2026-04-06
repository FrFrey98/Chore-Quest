import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { seedDefaults } from '@/lib/setup'

type UserInput = {
  name: string
  pin: string
  role: 'admin' | 'member' | 'child'
}

export async function POST(request: Request) {
  // Parse input
  let body: { users?: UserInput[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const { users } = body

  // Validate array
  if (!Array.isArray(users) || users.length < 2) {
    return NextResponse.json(
      { error: 'Mindestens 2 Benutzer erforderlich' },
      { status: 400 }
    )
  }

  // Validate at least one admin
  const hasAdmin = users.some((u) => u.role === 'admin')
  if (!hasAdmin) {
    return NextResponse.json(
      { error: 'Mindestens ein Admin ist erforderlich' },
      { status: 400 }
    )
  }

  const pinRegex = /^\d{4,8}$/
  const validRoles = ['admin', 'member', 'child']
  const trimmedNames: string[] = []

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const name = typeof user.name === 'string' ? user.name.trim() : ''

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: `Benutzer ${i + 1}: Name muss zwischen 2 und 50 Zeichen lang sein` },
        { status: 400 }
      )
    }

    if (!pinRegex.test(user.pin)) {
      return NextResponse.json(
        { error: `Benutzer ${i + 1}: PIN muss 4-8 Ziffern lang sein` },
        { status: 400 }
      )
    }

    if (!validRoles.includes(user.role)) {
      return NextResponse.json(
        { error: `Benutzer ${i + 1}: Ungültige Rolle` },
        { status: 400 }
      )
    }

    trimmedNames.push(name.toLowerCase())
  }

  // Validate unique names (case-insensitive)
  const uniqueNames = new Set(trimmedNames)
  if (uniqueNames.size !== trimmedNames.length) {
    return NextResponse.json(
      { error: 'Alle Namen müssen eindeutig sein' },
      { status: 400 }
    )
  }

  // Hash all PINs
  const hashedPins = await Promise.all(users.map((u) => bcrypt.hash(u.pin, 10)))

  // Create everything in a single transaction
  try {
    await prisma.$transaction(async (tx) => {
      const existingUsers = await tx.user.count()
      if (existingUsers > 0) {
        throw new Error('SETUP_ALREADY_DONE')
      }

      const createdIds: string[] = []
      for (let i = 0; i < users.length; i++) {
        const created = await tx.user.create({
          data: {
            name: users[i].name.trim(),
            pin: hashedPins[i],
            role: users[i].role,
          },
        })
        createdIds.push(created.id)
      }

      await seedDefaults(tx, createdIds)
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'SETUP_ALREADY_DONE') {
      return NextResponse.json(
        { error: 'Setup wurde bereits durchgeführt' },
        { status: 409 }
      )
    }
    throw error
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
