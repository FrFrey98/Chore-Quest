import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseBody } from '@/lib/validate'
import { updateStoreItemSchema } from '@/lib/schemas/store-item'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = await parseBody(req, updateStoreItemSchema)
  if (!parsed.success) return parsed.response
  const data = parsed.data

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Keine Änderungen' }, { status: 400 })
  }

  try {
    const item = await prisma.storeItem.update({
      where: { id: id },
      data,
    })
    return NextResponse.json(item)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Belohnung nicht gefunden' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.storeItem.update({
      where: { id: id },
      data: { isActive: false },
    })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Belohnung nicht gefunden' }, { status: 404 })
    }
    throw error
  }
  return new NextResponse(null, { status: 204 })
}
