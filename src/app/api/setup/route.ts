import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { seedDefaults } from '@/lib/setup'

type UserInput = {
  name: string
  pin: string
  role: 'admin' | 'member' | 'child'
}

type SetupBody = {
  users: UserInput[]
  locale?: string
  categories?: Array<{ name: string; emoji: string }>
  tasks?: Array<{
    title: string
    emoji: string
    points: number
    categoryName: string
    isRecurring: boolean
    recurringInterval?: string
  }>
}

export async function POST(request: Request) {
  // Parse input
  let body: SetupBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { users, locale, categories, tasks } = body

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

  // Validate locale
  if (locale !== undefined && !['en', 'de'].includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  // Validate categories
  if (categories !== undefined) {
    if (!Array.isArray(categories) || categories.length > 20) {
      return NextResponse.json({ error: 'Invalid categories' }, { status: 400 })
    }
    for (const cat of categories) {
      if (typeof cat.name !== 'string' || cat.name.trim().length === 0 || cat.name.length > 50) {
        return NextResponse.json({ error: 'Invalid category name' }, { status: 400 })
      }
      if (typeof cat.emoji !== 'string' || cat.emoji.length === 0) {
        return NextResponse.json({ error: 'Invalid category emoji' }, { status: 400 })
      }
    }
  }

  // Validate tasks
  if (tasks !== undefined) {
    if (!Array.isArray(tasks) || tasks.length > 100) {
      return NextResponse.json({ error: 'Invalid tasks' }, { status: 400 })
    }
    for (const task of tasks) {
      if (typeof task.title !== 'string' || task.title.trim().length === 0 || task.title.length > 100) {
        return NextResponse.json({ error: 'Invalid task title' }, { status: 400 })
      }
      if (typeof task.points !== 'number' || !Number.isInteger(task.points) || task.points < 1) {
        return NextResponse.json({ error: 'Invalid task points' }, { status: 400 })
      }
      if (task.isRecurring && (!task.recurringInterval || typeof task.recurringInterval !== 'string')) {
        return NextResponse.json({ error: 'Recurring tasks must have an interval' }, { status: 400 })
      }
    }
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

      await seedDefaults(tx, createdIds, { locale, categories, tasks })
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
