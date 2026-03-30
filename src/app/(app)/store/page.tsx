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

  const items = await prisma.storeItem.findMany({ where: { isActive: true }, orderBy: { pointCost: 'asc' } })
  const completions = await prisma.taskCompletion.findMany({
    where: { userId }, select: { points: true },
  })
  const purchases = await prisma.purchase.findMany({
    where: { userId }, select: { pointsSpent: true, itemId: true },
  })

  const earned = getTotalEarned(completions)
  const spent = purchases.reduce((s, p) => s + p.pointsSpent, 0)
  const balance = getCurrentPoints(earned, spent)
  const ownedItemIds = new Set(purchases.map((p) => p.itemId))

  const trophies = items.filter((i) => i.type === 'trophy').map((i) => ({
    ...i, alreadyOwned: ownedItemIds.has(i.id),
  }))
  const rewards = items.filter((i) => i.type === 'real_reward').map((i) => ({
    ...i, alreadyOwned: false,
  }))

  return <StoreClient trophies={trophies} rewards={rewards} balance={balance} />
}
