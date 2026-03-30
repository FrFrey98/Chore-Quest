import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned } from '@/lib/points'
import { PointsHeader } from '@/components/dashboard/points-header'
import { FeedItem } from '@/components/dashboard/feed-item'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const users = await prisma.user.findMany({
    include: {
      completions: { select: { points: true } },
      purchases: { select: { pointsSpent: true } },
    },
  })

  const userStats = users.map((u) => ({
    id: u.id,
    name: u.name ?? 'Unbekannt',
    earned: getTotalEarned(u.completions),
    spent: u.purchases.reduce((s, p) => s + p.pointsSpent, 0),
  }))

  const completions = await prisma.taskCompletion.findMany({
    take: 30,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { title: true, emoji: true } },
    },
  })

  const feed = completions.map((c) => ({
    id: c.id,
    type: 'completion' as const,
    user: { id: c.user.id, name: c.user.name ?? 'Unbekannt' },
    task: c.task,
    points: c.points,
    at: c.completedAt.toISOString(),
  }))

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <PointsHeader users={userStats} />
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Letzte Aktivitäten
      </h2>
      <div className="space-y-2">
        {feed.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">
            Noch keine Aktivitäten. Erledige die erste Aufgabe!
          </p>
        )}
        {feed.map((entry) => (
          <FeedItem key={entry.id} entry={entry} currentUserId={session!.user.id} />
        ))}
      </div>
    </div>
  )
}
