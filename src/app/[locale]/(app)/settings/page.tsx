import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { getVapidPublicKey } from '@/lib/push'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  if (!hasPermission(session.user.role, 'editSettings')) redirect('/')

  const [config, users, categories, achievements, storeItems, tasks, currentUser, quests] = await Promise.all([
    loadGameConfig(),
    prisma.user.findMany({
      select: { id: true, name: true, role: true, createdAt: true, vacationStart: true, vacationEnd: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.category.findMany({
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.storeItem.findMany({ orderBy: { type: 'asc' } }),
    prisma.task.findMany({
      where: { status: { in: ['active', 'pending_approval'] } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationsEnabled: true, installPromptDismissed: true },
    }),
    prisma.quest.findMany({
      include: {
        steps: {
          include: { task: { select: { id: true, title: true, emoji: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <SettingsClient
      config={config}
      users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), vacationStart: u.vacationStart?.toISOString() ?? null, vacationEnd: u.vacationEnd?.toISOString() ?? null }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, taskCount: c._count.tasks }))}
      achievements={achievements}
      storeItems={storeItems}
      tasks={tasks}
      quests={quests}
      userId={session.user.id}
      notificationsEnabled={currentUser?.notificationsEnabled ?? false}
      vapidPublicKey={getVapidPublicKey()}
    />
  )
}
