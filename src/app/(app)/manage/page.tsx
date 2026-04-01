import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ManageClient } from './manage-client'

export default async function ManagePage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [tasks, categories, rewards] = await Promise.all([
    prisma.task.findMany({
      include: { category: { select: { id: true, name: true, emoji: true } } },
      orderBy: [{ status: 'asc' }, { title: 'asc' }],
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.storeItem.findMany({
      where: { type: 'real_reward' },
      orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
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
  }))

  const serializedRewards = rewards.map((r) => ({
    id: r.id,
    title: r.title,
    emoji: r.emoji,
    description: r.description,
    pointCost: r.pointCost,
    isActive: r.isActive,
  }))

  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Lade...</div>}>
      <ManageClient
        tasks={serializedTasks}
        categories={categories}
        rewards={serializedRewards}
        initialTab={searchParams.tab ?? 'tasks'}
      />
    </Suspense>
  )
}
