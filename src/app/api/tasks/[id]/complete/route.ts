import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import { loadGameConfig } from '@/lib/config'
import { getNextDueAt } from '@/lib/recurring'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { applyBonus, updateStreakOnCompletion, recalculateStreak, getOrCreateStreakState, getEffectiveStreak } from '@/lib/streak'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'completeTasks')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const config = await loadGameConfig()

  const userId = session.user.id
  let withUserId: string | undefined
  let dateParam: string | undefined
  let offlineAt: string | undefined

  try {
    const body = await req.json()
    withUserId = body.withUserId
    dateParam = body.date
    offlineAt = body.offlineAt
  } catch {
    // No body or invalid JSON — solo completion, today
  }

  // Validate partner exists if shared
  if (withUserId) {
    const partner = await prisma.user.findUnique({ where: { id: withUserId } })
    if (!partner) {
      return NextResponse.json({ error: 'Partner nicht gefunden' }, { status: 400 })
    }
  }

  // Determine completion timestamp
  let completedAt: Date | undefined
  if (dateParam === 'yesterday') {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(23, 59, 0, 0)
    completedAt = yesterday
  } else if (dateParam && dateParam !== 'today') {
    return NextResponse.json({ error: 'Ungültiges Datum' }, { status: 400 })
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      scheduleOverrides: {
        select: { date: true, type: true },
      },
    },
  })
  if (!task || task.status !== 'active') {
    return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
  }

  const scheduleOpts = task.scheduleDays
    ? { scheduleDays: task.scheduleDays, overrides: task.scheduleOverrides.map((o) => ({ date: o.date, type: o.type as 'add' | 'skip' })) }
    : undefined

  // Determine the day start for duplicate checking
  const checkDayStart = new Date()
  if (dateParam === 'yesterday') {
    checkDayStart.setUTCDate(checkDayStart.getUTCDate() - 1)
  }
  checkDayStart.setUTCHours(0, 0, 0, 0)
  const checkDayEnd = new Date(checkDayStart)
  checkDayEnd.setUTCDate(checkDayEnd.getUTCDate() + 1)

  // Multi-completion limit check
  if (!task.allowMultiple) {
    const existingOnDay = await prisma.taskCompletion.findFirst({
      where: { taskId: task.id, userId, completedAt: { gte: checkDayStart, lt: checkDayEnd } },
    })
    if (existingOnDay) {
      return NextResponse.json({ error: dateParam === 'yesterday' ? 'Aufgabe gestern bereits erledigt' : 'Aufgabe heute bereits erledigt' }, { status: 409 })
    }
  } else if (task.dailyLimit) {
    const dayCount = await prisma.taskCompletion.count({
      where: { taskId: task.id, userId, completedAt: { gte: checkDayStart, lt: checkDayEnd } },
    })
    if (dayCount >= task.dailyLimit) {
      return NextResponse.json({ error: `Tageslimit erreicht (${task.dailyLimit}x)` }, { status: 409 })
    }
  }

  // Offline conflict detection
  if (offlineAt) {
    const offlineTime = new Date(offlineAt)
    const conflicting = await prisma.taskCompletion.findFirst({
      where: {
        taskId: task.id,
        userId: { not: userId },
        completedAt: { gte: offlineTime },
      },
      include: { user: { select: { name: true } } },
    })
    if (conflicting) {
      return NextResponse.json(
        { error: 'already_completed', completedBy: conflicting.user.name },
        { status: 409 }
      )
    }
  }

  const isShared = !!withUserId

  // Update streak and calculate bonus for current user
  let currentStreak: number
  if (dateParam === 'yesterday') {
    // For backfills: read current streak without mutating, recalculateStreak handles state after completion
    const state = await getOrCreateStreakState(userId)
    currentStreak = getEffectiveStreak(state)
  } else {
    const result = await updateStreakOnCompletion(userId, config.streakTiers)
    currentStreak = result.currentStreak
  }
  const pointsWithBonus = applyBonus(task.points, currentStreak, isShared, { tiers: config.streakTiers, teamworkPercent: config.teamworkBonusPercent })

  const completion = await prisma.taskCompletion.create({
    data: {
      taskId: task.id,
      userId,
      points: pointsWithBonus,
      withUserId: withUserId ?? null,
      ...(completedAt ? { completedAt } : {}),
    },
  })

  // Create partner completion if shared
  let partnerCompletion = null
  if (withUserId) {
    let partnerStreak: number
    if (dateParam === 'yesterday') {
      const partnerState = await getOrCreateStreakState(withUserId)
      partnerStreak = getEffectiveStreak(partnerState)
    } else {
      const result = await updateStreakOnCompletion(withUserId, config.streakTiers)
      partnerStreak = result.currentStreak
    }
    const partnerPoints = applyBonus(task.points, partnerStreak, true, { tiers: config.streakTiers, teamworkPercent: config.teamworkBonusPercent })
    partnerCompletion = await prisma.taskCompletion.create({
      data: {
        taskId: task.id,
        userId: withUserId,
        points: partnerPoints,
        withUserId: userId,
        ...(completedAt ? { completedAt } : {}),
      },
    })
  }

  // For yesterday backfills, recalculate streak from actual completion records
  if (dateParam === 'yesterday') {
    await recalculateStreak(userId)
    if (withUserId) {
      await recalculateStreak(withUserId)
    }
  }

  // Base date for recurring calculations: yesterday if backfilling, today otherwise
  const recurringBaseDate = completedAt ?? new Date()

  // Handle recurring/one-time task state
  if (task.allowMultiple) {
    if (task.dailyLimit && task.isRecurring && (task.recurringInterval || task.scheduleDays)) {
      const newCount = await prisma.taskCompletion.count({
        where: { taskId: task.id, userId, completedAt: { gte: checkDayStart, lt: checkDayEnd } },
      })
      if (newCount >= task.dailyLimit) {
        const nextDueAt = getNextDueAt(task.recurringInterval ?? 'daily', recurringBaseDate, config.recurringIntervals, scheduleOpts)
        if (nextDueAt) {
          await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
        }
      }
    }
  } else if (task.isRecurring && (task.recurringInterval || task.scheduleDays)) {
    const nextDueAt = getNextDueAt(task.recurringInterval ?? 'daily', recurringBaseDate, config.recurringIntervals, scheduleOpts)
    if (nextDueAt) {
      await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
    }
  } else {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'archived' },
    })
  }

  // Achievement check for current user
  let newAchievements: { id: string; title: string; emoji: string }[] = []
  try {
    const newAchievementIds = await checkAndUnlockAchievements(userId, config.levelDefinitions)
    if (newAchievementIds.length > 0) {
      newAchievements = await prisma.achievement.findMany({
        where: { id: { in: newAchievementIds } },
        select: { id: true, title: true, emoji: true },
        orderBy: { sortOrder: 'asc' },
      })
    }
  } catch {
    // Achievement check failure should not block the completion response
  }

  // Achievement check for partner
  if (withUserId) {
    try {
      await checkAndUnlockAchievements(withUserId, config.levelDefinitions)
    } catch {
      // Silent fail
    }
  }

  return NextResponse.json({
    ...completion,
    basePoints: task.points,
    bonusPoints: pointsWithBonus - task.points,
    streakDays: currentStreak,
    isShared,
    newAchievements,
  }, { status: 201 })
}
