import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const categories = await prisma.category.findMany()
  const storeItems = await prisma.storeItem.findMany({ orderBy: { type: 'asc' } })
  const tasks = await prisma.task.findMany({
    where: { status: { in: ['active', 'pending_approval'] } },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminClient
      categories={categories}
      storeItems={storeItems}
      tasks={tasks}
      userId={session.user.id}
    />
  )
}
