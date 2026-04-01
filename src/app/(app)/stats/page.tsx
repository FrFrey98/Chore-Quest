import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatsClient } from './stats-client'

export default async function StatsPage({ searchParams }: { searchParams: { tab?: string; from?: string; to?: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const now = new Date()
  const defaultFrom = new Date(now)
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 30)

  const from = searchParams.from ?? defaultFrom.toISOString().slice(0, 10)
  const to = searchParams.to ?? now.toISOString().slice(0, 10)

  const fromDate = new Date(from + 'T00:00:00Z')
  const toDate = new Date(to + 'T23:59:59.999Z')

  const [completions, users, categories, tasks] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { completedAt: { gte: fromDate, lte: toDate } },
      include: {
        task: { select: { id: true, title: true, emoji: true, categoryId: true } },
      },
      orderBy: { completedAt: 'asc' },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true, emoji: true } }),
    prisma.task.findMany({
      where: { status: 'active' },
      select: { id: true, title: true, emoji: true },
      orderBy: { title: 'asc' },
    }),
  ])

  const serialized = completions.map((c) => ({
    id: c.id,
    completedAt: c.completedAt.toISOString(),
    points: c.points,
    userId: c.userId,
    taskId: c.taskId,
    task: c.task,
  }))

  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Lade Statistiken...</div>}>
      <StatsClient
        completions={serialized}
        users={users}
        currentUserId={userId}
        categories={categories}
        allTasks={tasks}
        from={from}
        to={to}
      />
    </Suspense>
  )
}
