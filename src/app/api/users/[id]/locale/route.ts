import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'No permission' }, { status: 403 })
  }

  const body = await req.json()
  const locale = body.locale

  if (!['en', 'de'].includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id },
    data: { locale },
  })

  return NextResponse.json({ locale })
}
