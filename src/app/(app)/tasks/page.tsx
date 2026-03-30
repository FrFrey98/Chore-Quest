import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TasksClient } from './tasks-client'

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const now = new Date()
  const tasks = await prisma.task.findMany({
    where: { status: 'active' },
    include: { category: true },
    orderBy: { points: 'desc' },
  })

  const visible = tasks.filter(
    (t) => !t.isRecurring || !t.nextDueAt || t.nextDueAt <= now
  )

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  const grouped = categories.map((cat) => ({
    ...cat,
    tasks: visible.filter((t) => t.categoryId === cat.id),
  }))

  return <TasksClient grouped={grouped} />
}
