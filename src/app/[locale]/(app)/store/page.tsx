import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTotalEarned, getCurrentPoints } from '@/lib/points'
import { StoreClient } from './store-client'

export default async function StorePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const items = await prisma.storeItem.findMany({
    where: { isActive: true, type: 'real_reward' },
    orderBy: { pointCost: 'asc' },
  })
  const completions = await prisma.taskCompletion.findMany({
    where: { userId }, select: { points: true },
  })
  const purchases = await prisma.purchase.findMany({
    where: { userId }, select: { pointsSpent: true },
  })

  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((s, p) => s + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)

  const myPendingPurchases = await prisma.purchase.findMany({
    where: {
      userId,
      redeemedAt: null,
      item: { type: 'real_reward' },
    },
    include: {
      item: { select: { title: true, emoji: true } },
    },
    orderBy: { purchasedAt: 'desc' },
  })

  const myPendingSerialized = myPendingPurchases.map((p) => ({
    id: p.id,
    purchasedAt: p.purchasedAt.toISOString(),
    item: { title: p.item.title, emoji: p.item.emoji },
  }))

  return (
    <StoreClient
      rewards={items}
      balance={balance}
      myPendingPurchases={myPendingSerialized}
    />
  )
}
