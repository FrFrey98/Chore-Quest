import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { exportAllData } from '@/lib/backup'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  const backup = await exportAllData()
  const date = new Date().toISOString().split('T')[0]

  return NextResponse.json(backup, {
    headers: {
      'Content-Disposition': `attachment; filename="haushalt-quest-backup-${date}.json"`,
    },
  })
}
