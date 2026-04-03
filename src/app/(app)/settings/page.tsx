import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadGameConfig } from '@/lib/config'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [config, users, categories, achievements, storeItems, tasks] = await Promise.all([
    loadGameConfig(),
    prisma.user.findMany({ select: { id: true, name: true } }),
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
  ])

  return (
    <SettingsClient
      config={config}
      users={users}
      categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, taskCount: c._count.tasks }))}
      achievements={achievements}
      storeItems={storeItems}
      tasks={tasks}
      userId={session.user.id}
    />
  )
}
