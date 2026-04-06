import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { ApprovalsClient } from './approvals-client'

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  if (!hasPermission(session.user.role, 'approveTasks')) redirect('/')

  const approvals = await prisma.taskApproval.findMany({
    where: {
      status: 'pending',
      requestedById: { not: session.user.id },
    },
    include: {
      task: true,
      requestedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <ApprovalsClient approvals={approvals} />
}
