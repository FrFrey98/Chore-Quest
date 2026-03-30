import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'
import { StatsClient } from './stats-client'

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    include: { task: { select: { title: true, emoji: true, categoryId: true } } },
    orderBy: { completedAt: 'asc' },
  })

  const allCompletions = await prisma.taskCompletion.findMany({
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { categoryId: true } },
    },
    orderBy: { completedAt: 'asc' },
  })

  const categories = await prisma.category.findMany()

  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  const taskCount: Record<string, { count: number; title: string; emoji: string }> = {}
  for (const c of completions) {
    if (!taskCount[c.taskId]) taskCount[c.taskId] = { count: 0, title: c.task.title, emoji: c.task.emoji }
    taskCount[c.taskId].count++
  }
  const topTasks = Object.values(taskCount).sort((a, b) => b.count - a.count).slice(0, 5)

  const daySet = new Set(completions.map((c) => c.completedAt.toISOString().slice(0, 10)))
  let streak = 0
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const startDay = daySet.has(todayKey) ? 0 : 1
  for (let i = startDay; i < 365; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    if (daySet.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  const totalEarned = getTotalEarned(completions)
  const level = getLevel(totalEarned)

  const byWeek: Record<string, Record<string, number>> = {}
  const byCategory: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const d = new Date(c.completedAt)
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    const week = d.toISOString().slice(0, 10)
    if (!byWeek[week]) byWeek[week] = {}
    byWeek[week][c.user.name ?? 'Unbekannt'] = (byWeek[week][c.user.name ?? 'Unbekannt'] ?? 0) + c.points

    const cat = c.task.categoryId
    if (!byCategory[cat]) byCategory[cat] = {}
    byCategory[cat][c.user.name ?? 'Unbekannt'] = (byCategory[cat][c.user.name ?? 'Unbekannt'] ?? 0) + 1
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { item: { select: { title: true, emoji: true, type: true } } },
    orderBy: { purchasedAt: 'desc' },
  })

  const byMonth: Record<string, Record<string, number>> = {}
  for (const c of allCompletions) {
    const month = c.completedAt.toISOString().slice(0, 7)
    if (!byMonth[month]) byMonth[month] = {}
    byMonth[month][c.user.name ?? 'Unbekannt'] = (byMonth[month][c.user.name ?? 'Unbekannt'] ?? 0) + c.points
  }

  const purchasesForClient = purchases.map((p) => ({
    id: p.id,
    purchasedAt: p.purchasedAt.toISOString(),
    redeemedAt: p.redeemedAt?.toISOString() ?? null,
    pointsSpent: p.pointsSpent,
    item: p.item,
  }))

  return (
    <StatsClient
      personal={{ heatmap, topTasks, streak, totalCompletions: completions.length, totalPointsEarned: totalEarned, level, purchases: purchasesForClient }}
      comparison={{ byWeek, byCategory, byMonth }}
      categories={categories}
    />
  )
}
