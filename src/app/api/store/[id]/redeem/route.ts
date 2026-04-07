import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findUnique({
    where: { id },
  })

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
  }

  // Only the buyer themselves can redeem
  if (purchase.userId !== session.user.id) {
    return NextResponse.json({ error: 'Only the buyer can redeem their own reward' }, { status: 403 })
  }

  if (purchase.redeemedAt) {
    return NextResponse.json({ error: 'Already redeemed' }, { status: 409 })
  }

  const updated = await prisma.purchase.update({
    where: { id },
    data: { redeemedAt: new Date(), notifiedAt: null },
  })
  return NextResponse.json(updated)
}
