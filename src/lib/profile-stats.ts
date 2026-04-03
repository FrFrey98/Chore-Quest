import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'
import { getOrCreateStreakState } from '@/lib/streak'
import { type LevelDef } from '@/lib/config'

export async function computeProfileStats(userId: string, levels?: LevelDef[]) {
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

  const streakState = await getOrCreateStreakState(userId)
  const streak = streakState.currentStreak

  const totalEarned = getTotalEarned(completions)
  const level = getLevel(totalEarned, levels)

  return {
    completionCount: completions.length,
    totalEarned,
    level,
    streak,
    heatmap,
    topTasks,
  }
}
