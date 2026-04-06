import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTasksForMonth } from '@/lib/calendar'
import { TasksClient } from './tasks-client'

export default async function TasksPage({ searchParams }: { searchParams: { view?: string; year?: string; month?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const now = new Date()
  const view = searchParams.view ?? 'list'
  const calYear = searchParams.year ? parseInt(searchParams.year) : now.getUTCFullYear()
  const calMonth = searchParams.month ? parseInt(searchParams.month) : now.getUTCMonth() + 1

  const userId = session.user?.id
  const users = await prisma.user.findMany({ select: { id: true, name: true } })
  const partner = users.find((u) => u.id !== userId)
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  const tasks = await prisma.task.findMany({
    where: { status: 'active' },
    include: { category: true },
    orderBy: { points: 'desc' },
  })

  // List view data
  const visible = tasks.filter(
    (t) => !t.isRecurring || !t.nextDueAt || t.nextDueAt <= now
  )
  const grouped = categories.map((cat) => ({
    ...cat,
    tasks: visible.filter((t) => t.categoryId === cat.id),
  }))

  // Calendar view data
  let calendarDays = null
  if (view === 'calendar') {
    const monthStart = new Date(Date.UTC(calYear, calMonth - 1, 1))
    const monthEnd = new Date(Date.UTC(calYear, calMonth, 0, 23, 59, 59))

    const [completions, overrides] = await Promise.all([
      prisma.taskCompletion.findMany({
        where: {
          completedAt: { gte: monthStart, lte: monthEnd },
        },
        select: { taskId: true, completedAt: true, points: true },
      }),
      prisma.taskScheduleOverride.findMany({
        where: {
          date: {
            gte: monthStart.toISOString().slice(0, 10),
            lte: monthEnd.toISOString().slice(0, 10),
          },
        },
        select: { taskId: true, date: true, type: true },
      }),
    ])

    const calendarTasks = tasks
      .filter((t) => t.isRecurring)
      .map((t) => ({
        id: t.id,
        emoji: t.emoji,
        title: t.title,
        points: t.points,
        isRecurring: t.isRecurring,
        recurringInterval: t.recurringInterval,
        scheduleDays: t.scheduleDays ?? null,
        nextDueAt: t.nextDueAt,
      }))

    const calCompletions = completions.map((c) => ({
      taskId: c.taskId,
      date: c.completedAt.toISOString().slice(0, 10),
      points: c.points,
    }))

    const calOverrides = overrides.map((o) => ({
      taskId: o.taskId,
      date: o.date,
      type: o.type as 'add' | 'skip',
    }))

    calendarDays = getTasksForMonth(calYear, calMonth, calendarTasks, calCompletions, calOverrides)
  }

  const availableTasks = tasks
    .filter((t) => t.isRecurring)
    .map((t) => ({ id: t.id, emoji: t.emoji, title: t.title }))

  return (
    <TasksClient
      grouped={grouped}
      categories={categories}
      users={users}
      userRole={session.user.role}
      partnerId={partner?.id}
      partnerName={partner?.name ?? undefined}
      view={view}
      calendarDays={calendarDays}
      calYear={calYear}
      calMonth={calMonth}
      today={now.toISOString().slice(0, 10)}
      availableTasks={availableTasks}
    />
  )
}
