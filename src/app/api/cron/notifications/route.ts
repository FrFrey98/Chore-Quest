import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTaskDueForNotification } from '@/lib/push'
import { dispatchNotification } from '@/lib/notifications/dispatcher'

export async function GET(req: NextRequest) {
  // Authenticate via cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret')
  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  // Get all users who have any notification channel enabled
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { notificationsEnabled: true },
        { telegramChatId: { not: null } },
        { ntfyEnabled: true },
      ],
    },
    select: { id: true },
  })

  if (users.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sentCount = 0

  for (const task of uncompletedTasks) {
    const payload = {
      title: 'Chore-Quest',
      body: `${task.emoji} ${task.title}`,
      url: '/tasks',
    }

    for (const user of users) {
      const result = await dispatchNotification(user.id, payload)
      sentCount += result.sent.length
    }

    // Mark task as notified
    await prisma.task.update({
      where: { id: task.id },
      data: { lastNotifiedAt: now },
    })
  }

  return NextResponse.json({ sent: sentCount })
}
