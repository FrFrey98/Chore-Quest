import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextDueAt } from '@/lib/recurring'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { applyBonus, updateStreakOnCompletion } from '@/lib/streak'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  let withUserId: string | undefined

  try {
    const body = await req.json()
    withUserId = body.withUserId
  } catch {
    // No body or invalid JSON — solo completion
  }

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task || task.status !== 'active') {
    return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
  }

  // Multi-completion limit check
  if (!task.allowMultiple) {
    // Standard: check if already completed today
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const existingToday = await prisma.taskCompletion.findFirst({
      where: { taskId: task.id, userId, completedAt: { gte: todayStart } },
    })
    if (existingToday) {
      return NextResponse.json({ error: 'Aufgabe heute bereits erledigt' }, { status: 409 })
    }
  } else if (task.dailyLimit) {
    // Multi: check against daily limit
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const todayCount = await prisma.taskCompletion.count({
      where: { taskId: task.id, userId, completedAt: { gte: todayStart } },
    })
    if (todayCount >= task.dailyLimit) {
      return NextResponse.json({ error: `Tageslimit erreicht (${task.dailyLimit}x)` }, { status: 409 })
    }
  }

  const isShared = !!withUserId

  // Update streak and calculate bonus for current user
  const { currentStreak } = await updateStreakOnCompletion(userId)
  const pointsWithBonus = applyBonus(task.points, currentStreak, isShared)

  const completion = await prisma.taskCompletion.create({
    data: {
      taskId: task.id,
      userId,
      points: pointsWithBonus,
      withUserId: withUserId ?? null,
    },
  })

  // Create partner completion if shared
  let partnerCompletion = null
  if (withUserId) {
    const { currentStreak: partnerStreak } = await updateStreakOnCompletion(withUserId)
    const partnerPoints = applyBonus(task.points, partnerStreak, true)
    partnerCompletion = await prisma.taskCompletion.create({
      data: {
        taskId: task.id,
        userId: withUserId,
        points: partnerPoints,
        withUserId: userId,
      },
    })
  }

  // Handle recurring/one-time task state
  if (task.allowMultiple && task.dailyLimit) {
    // Only set nextDueAt when daily limit is reached
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const newCount = await prisma.taskCompletion.count({
      where: { taskId: task.id, userId, completedAt: { gte: todayStart } },
    })
    if (newCount >= task.dailyLimit && task.isRecurring && task.recurringInterval) {
      const nextDueAt = getNextDueAt(task.recurringInterval, new Date())
      await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
    }
  } else if (task.isRecurring && task.recurringInterval) {
    const nextDueAt = getNextDueAt(task.recurringInterval, new Date())
    await prisma.task.update({ where: { id: task.id }, data: { nextDueAt } })
  } else {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'archived' },
    })
  }

  // Achievement check for current user
  let newAchievements: { id: string; title: string; emoji: string }[] = []
  try {
    const newAchievementIds = await checkAndUnlockAchievements(userId)
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
      await checkAndUnlockAchievements(withUserId)
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
