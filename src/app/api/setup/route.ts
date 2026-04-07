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
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { users } = body

  // Validate array
  if (!Array.isArray(users) || users.length < 2) {
    return NextResponse.json(
      { error: 'At least 2 users required' },
      { status: 400 }
    )
  }

  // Validate at least one admin
  const hasAdmin = users.some((u) => u.role === 'admin')
  if (!hasAdmin) {
    return NextResponse.json(
      { error: 'At least one admin is required' },
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
        { error: `User ${i + 1}: Name must be between 2 and 50 characters` },
        { status: 400 }
      )
    }

    if (typeof user.pin !== 'string') {
      return NextResponse.json({ error: `PIN for "${name}" is invalid` }, { status: 400 })
    }

    if (!pinRegex.test(user.pin)) {
      return NextResponse.json(
        { error: `User ${i + 1}: PIN must be 4-8 digits` },
        { status: 400 }
      )
    }

    if (!validRoles.includes(user.role)) {
      return NextResponse.json(
        { error: `User ${i + 1}: Invalid role` },
        { status: 400 }
      )
    }

    trimmedNames.push(name.toLowerCase())
  }

  // Validate unique names (case-insensitive)
  const uniqueNames = new Set(trimmedNames)
  if (uniqueNames.size !== trimmedNames.length) {
    return NextResponse.json(
      { error: 'All names must be unique' },
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
        { error: 'Setup has already been completed' },
        { status: 409 }
      )
    }
    throw error
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
