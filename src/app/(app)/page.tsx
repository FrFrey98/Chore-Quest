import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getLevel } from '@/lib/points'
import { PointsHeader } from '@/components/dashboard/points-header'
import { FeedItem } from '@/components/dashboard/feed-item'
import { DashboardNotifications } from '@/components/dashboard/dashboard-notifications'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const users = await prisma.user.findMany({
    include: {
      completions: { select: { points: true } },
      purchases: { select: { pointsSpent: true } },
      userAchievements: { select: { id: true } },
    },
  })

  const userStats = users.map((u) => ({
    id: u.id,
    name: u.name ?? 'Unbekannt',
    earned: getTotalEarned(u.completions),
    spent: u.purchases.reduce((s, p) => s + p.pointsSpent, 0),
  }))

  const partner = users.find((u) => u.id !== session!.user.id)
  const partnerLevel = partner ? getLevel(getTotalEarned(partner.completions)) : null
  const partnerAchievementCount = partner ? partner.userAchievements.length : 0

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const completions = await prisma.taskCompletion.findMany({
    take: 30,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { title: true, emoji: true } },
    },
  })

  const recentRedemptions = await prisma.purchase.findMany({
    where: {
      redeemedAt: { not: null, gte: sevenDaysAgo },
    },
    orderBy: { redeemedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      item: { select: { title: true, emoji: true } },
    },
  })

  const completionFeed = completions.map((c) => ({
    id: c.id,
    type: 'completion' as const,
    user: { id: c.user.id, name: c.user.name ?? 'Unbekannt' },
    task: c.task,
    points: c.points,
    at: c.completedAt.toISOString(),
  }))

  const redemptionFeed = recentRedemptions.map((p) => ({
    id: p.id,
    type: 'redemption' as const,
    user: { id: p.user.id, name: p.user.name ?? 'Unbekannt' },
    item: p.item,
    points: 0,
    at: p.redeemedAt!.toISOString(),
  }))

  const feed = [...completionFeed, ...redemptionFeed].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  )

  return (
    <div>
      <DashboardNotifications />
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <PointsHeader users={userStats} />

      {partner && partnerLevel && (
        <Link href={`/profile/${partner.id}`}>
          <div className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="text-2xl">👫</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{partner.name ?? 'Unbekannt'}</p>
              <p className="text-xs text-slate-500">{partnerLevel.title} · {partnerAchievementCount} Achievements</p>
            </div>
            <span className="text-slate-400 text-sm">›</span>
          </div>
        </Link>
      )}

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Letzte Aktivitäten
      </h2>
      <div className="space-y-2">
        {feed.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-lg font-semibold text-slate-700">Noch keine Aktivitäten</p>
            <p className="text-sm text-slate-400 mt-1">
              Erledige deine erste Aufgabe und starte das Spiel!
            </p>
          </div>
        )}
        {feed.map((entry) => (
          <FeedItem key={entry.id} entry={entry} currentUserId={session!.user.id} />
        ))}
      </div>
    </div>
  )
}
