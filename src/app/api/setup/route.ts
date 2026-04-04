import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { seedDefaults } from '@/lib/setup'

export async function POST(request: Request) {
  // Parse and validate input
  let body: { user1?: { name?: string; pin?: string }; user2?: { name?: string; pin?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const { user1, user2 } = body
  if (!user1?.name || !user1?.pin || !user2?.name || !user2?.pin) {
    return NextResponse.json(
      { error: 'Name und PIN sind für beide Spieler erforderlich' },
      { status: 400 }
    )
  }

  const name1 = user1.name.trim()
  const name2 = user2.name.trim()

  // Validate names
  if (name1.length < 2 || name1.length > 50 || name2.length < 2 || name2.length > 50) {
    return NextResponse.json(
      { error: 'Namen müssen zwischen 2 und 50 Zeichen lang sein' },
      { status: 400 }
    )
  }
  if (name1.toLowerCase() === name2.toLowerCase()) {
    return NextResponse.json(
      { error: 'Die Namen müssen unterschiedlich sein' },
      { status: 400 }
    )
  }

  // Validate PINs
  const pinRegex = /^\d{4,8}$/
  if (!pinRegex.test(user1.pin) || !pinRegex.test(user2.pin)) {
    return NextResponse.json(
      { error: 'PINs müssen 4-8 Ziffern lang sein' },
      { status: 400 }
    )
  }

  // Hash PINs
  const hashedPin1 = await bcrypt.hash(user1.pin, 10)
  const hashedPin2 = await bcrypt.hash(user2.pin, 10)

  // Create everything in a single transaction (includes user-exists check to prevent race conditions)
  try {
    await prisma.$transaction(async (tx) => {
      const existingUsers = await tx.user.count()
      if (existingUsers > 0) {
        throw new Error('SETUP_ALREADY_DONE')
      }

      const createdUser1 = await tx.user.create({
        data: { name: name1, pin: hashedPin1 },
      })
      const createdUser2 = await tx.user.create({
        data: { name: name2, pin: hashedPin2 },
      })
      await seedDefaults(tx, createdUser1.id, createdUser2.id)
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
