import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { ManageClient } from './manage-client'

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [tasks, categories, rewards, users] = await Promise.all([
    prisma.task.findMany({
      include: {
        category: { select: { id: true, name: true, emoji: true } },
        assignedUsers: { select: { id: true } },
      },
      orderBy: [{ status: 'asc' }, { title: 'asc' }],
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.storeItem.findMany({
      where: { type: 'real_reward' },
      orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    emoji: t.emoji,
    points: t.points,
    categoryId: t.categoryId,
    isRecurring: t.isRecurring,
    recurringInterval: t.recurringInterval,
    status: t.status,
    allowMultiple: t.allowMultiple,
    dailyLimit: t.dailyLimit,
    scheduleDays: t.scheduleDays ?? null,
    scheduleTime: t.scheduleTime ?? null,
    assignedUserIds: t.assignedUsers.map((u) => u.id),
  }))

  const serializedRewards = rewards.map((r) => ({
    id: r.id,
    title: r.title,
    emoji: r.emoji,
    description: r.description,
    pointCost: r.pointCost,
    isActive: r.isActive,
  }))

  const tc = await getTranslations('common')

  return (
    <Suspense fallback={<div className="text-center py-16 text-muted-foreground">{tc('loading')}</div>}>
      <ManageClient
        tasks={serializedTasks}
        categories={categories}
        rewards={serializedRewards}
        users={users}
        initialTab={tab ?? 'tasks'}
      />
    </Suspense>
  )
}
