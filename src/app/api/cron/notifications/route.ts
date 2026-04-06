import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPushConfigured, sendPush, buildNotificationPayload, isTaskDueForNotification } from '@/lib/push'

export async function GET(req: NextRequest) {
  // Authenticate via cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret')
  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ skipped: true, reason: 'VAPID not configured' })
  }

  const now = new Date()

  // Find all active recurring tasks with scheduleTime
  const tasks = await prisma.task.findMany({
    where: {
      status: 'active',
      isRecurring: true,
      scheduleTime: { not: null },
    },
    select: {
      id: true,
      title: true,
      emoji: true,
      scheduleTime: true,
      scheduleDays: true,
      nextDueAt: true,
      lastNotifiedAt: true,
    },
  })

  // Filter tasks that are due for notification right now
  const dueTasks = tasks.filter((task) => isTaskDueForNotification(task, now))

  if (dueTasks.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Check which tasks are not yet completed today
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1)

  const completionsToday = await prisma.taskCompletion.findMany({
    where: {
      taskId: { in: dueTasks.map((t) => t.id) },
      completedAt: { gte: todayStart, lt: todayEnd },
    },
    select: { taskId: true },
  })

  const completedTaskIds = new Set(completionsToday.map((c) => c.taskId))
  const uncompletedTasks = dueTasks.filter((t) => !completedTaskIds.has(t.id))

  if (uncompletedTasks.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Get all push subscriptions for users with notifications enabled
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      user: { notificationsEnabled: true },
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  })

  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sentCount = 0
  const expiredSubscriptionIds: string[] = []

  for (const task of uncompletedTasks) {
    const payload = buildNotificationPayload(task)

    for (const sub of subscriptions) {
      try {
        const success = await sendPush(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        if (success) {
          sentCount++
        } else {
          expiredSubscriptionIds.push(sub.id)
        }
      } catch {
        // Transient push failure — skip this subscription, continue with others
      }
    }

    // Mark task as notified
    await prisma.task.update({
      where: { id: task.id },
      data: { lastNotifiedAt: now },
    })
  }

  // Clean up expired subscriptions
  if (expiredSubscriptionIds.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expiredSubscriptionIds } },
    })
  }

  return NextResponse.json({ sent: sentCount, expired: expiredSubscriptionIds.length })
}
