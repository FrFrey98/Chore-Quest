import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'

export async function computeProfileStats(userId: string) {
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    include: { task: { select: { title: true, emoji: true, categoryId: true } } },
    orderBy: { completedAt: 'asc' },
  })

  const heatmap: Record<string, number> = {}
  for (const c of completions) {
    const day = c.completedAt.toISOString().slice(0, 10)
    heatmap[day] = (heatmap[day] ?? 0) + c.points
  }

  const taskCount: Record<string, { id: string; count: number; title: string; emoji: string }> = {}
  for (const c of completions) {
    if (!taskCount[c.taskId]) taskCount[c.taskId] = { id: c.taskId, count: 0, title: c.task.title, emoji: c.task.emoji }
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

  return {
    completionCount: completions.length,
    totalEarned,
    level,
    streak,
    heatmap,
    topTasks,
  }
}
