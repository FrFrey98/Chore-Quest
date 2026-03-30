import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchase = await prisma.purchase.findUnique({ where: { id: params.id } })
  if (!purchase || purchase.userId !== session.user.id) {
    return NextResponse.json({ error: 'Kauf nicht gefunden' }, { status: 404 })
  }
  if (purchase.redeemedAt) {
    return NextResponse.json({ error: 'Bereits eingelöst' }, { status: 409 })
  }

  const updated = await prisma.purchase.update({
    where: { id: params.id },
    data: { redeemedAt: new Date() },
  })
  return NextResponse.json(updated)
}
