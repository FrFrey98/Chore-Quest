import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { validateBackup, restoreAllData, createPreRestoreBackup } from '@/lib/backup'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 })
  }

  const validation = validateBackup(body)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  try {
    await createPreRestoreBackup()
  } catch (err) {
    return NextResponse.json({ error: 'Pre-Restore-Backup fehlgeschlagen' }, { status: 500 })
  }

  try {
    await restoreAllData(validation.backup)
  } catch (err) {
    return NextResponse.json({ error: 'Restore fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
