import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevel, getTotalEarned } from '@/lib/points'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('tab') ?? 'personal'
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

  const dateFilter = from || to
    ? { completedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
    : {}

  if (tab === 'personal') {
    const completions = await prisma.taskCompletion.findMany({
      where: { userId: session.user.id, ...dateFilter },
      include: { task: { select: { title: true, emoji: true } } },
      orderBy: { completedAt: 'asc' },
    })

    const allTimeCompletions = await prisma.taskCompletion.findMany({
      where: { userId: session.user.id },
      select: { points: true, completedAt: true },
    })
    const totalEarned = getTotalEarned(allTimeCompletions)

    // Streak
    const daySet = new Set(
      allTimeCompletions.map((c) => c.completedAt.toISOString().slice(0, 10))
    )
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() - i)
      if (daySet.has(d.toISOString().slice(0, 10))) {
        streak++
      } else {
        break
      }
    }

    // Top tasks
    const taskCount: Record<string, { count: number; title: string; emoji: string }> = {}
    for (const c of completions) {
      const key = c.taskId
      if (!taskCount[key]) taskCount[key] = { count: 0, title: c.task.title, emoji: c.task.emoji }
      taskCount[key].count++
    }
    const topTasks = Object.values(taskCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Heatmap: points per day
    const heatmap: Record<string, number> = {}
    for (const c of completions) {
      const day = c.completedAt.toISOString().slice(0, 10)
      heatmap[day] = (heatmap[day] ?? 0) + c.points
    }

    return NextResponse.json({
      totalCompletions: completions.length,
      totalPointsEarned: completions.reduce((s, c) => s + c.points, 0),
      level: getLevel(totalEarned),
      streak,
      topTasks,
      heatmap,
    })
  }

  // Comparison tab
  const allCompletions = await prisma.taskCompletion.findMany({
    where: dateFilter,
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { categoryId: true } },
    },
    orderBy: { completedAt: 'asc' },
  })

  // Group by week and user
  const byWeek: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const week = getWeekKey(c.completedAt)
    if (!byWeek[week]) byWeek[week] = {}
    byWeek[week][c.user.name] = (byWeek[week][c.user.name] ?? 0) + c.points
  }

  // Category distribution per user
  const byCategory: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const cat = c.task.categoryId
    if (!byCategory[cat]) byCategory[cat] = {}
    byCategory[cat][c.user.name] = (byCategory[cat][c.user.name] ?? 0) + 1
  }

  return NextResponse.json({ byWeek, byCategory })
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d.toISOString().slice(0, 10)
}
