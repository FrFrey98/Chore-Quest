import { vi, describe, it, expect } from 'vitest'
import { getServerSession } from 'next-auth'

const mockBackup = {
  meta: { version: 1, exportedAt: '2026-04-07T00:00:00.000Z', appVersion: '1.0.0' },
  data: {
    users: [],
    categories: [],
    tasks: [],
    taskCompletions: [],
    taskApprovals: [],
    storeItems: [],
    purchases: [],
    achievements: [],
    userAchievements: [],
    streakStates: [],
    appConfigs: [],
    taskScheduleOverrides: [],
    pushSubscriptions: [],
    taskAssignments: [],
  },
}

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-1', name: 'Admin', role: 'admin' } }),
}))

vi.mock('@/lib/auth', () => ({ authOptions: {} }))

vi.mock('@/lib/backup', async () => {
  const actual = await vi.importActual<typeof import('@/lib/backup')>('@/lib/backup')
  return {
    ...actual,
    exportAllData: vi.fn().mockResolvedValue(mockBackup),
    restoreAllData: vi.fn().mockResolvedValue(undefined),
    createPreRestoreBackup: vi.fn().mockResolvedValue('/app/data/backups/pre-restore-test.json'),
  }
})

describe('GET /api/settings/backup', () => {
  it('returns 200 with backup JSON and content-disposition header', async () => {
    const { GET } = await import('@/app/api/settings/backup/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.meta.version).toBe(1)
    expect(data.data.users).toEqual([])
    const disposition = res.headers.get('content-disposition')
    expect(disposition).toMatch(/attachment; filename="haushalt-quest-backup-\d{4}-\d{2}-\d{2}\.json"/)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { GET } = await import('@/app/api/settings/backup/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin role', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { id: 'user-2', name: 'Child', role: 'child' } })
    const { GET } = await import('@/app/api/settings/backup/route')
    const res = await GET()
    expect(res.status).toBe(403)
  })
})

describe('POST /api/settings/backup/restore', () => {
  it('returns 200 on valid restore', async () => {
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBackup),
      }) as any
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('returns 400 on invalid JSON body', async () => {
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json{{{',
      }) as any
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it('returns 400 on invalid backup structure', async () => {
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: { version: 99, exportedAt: '2026-04-07T00:00:00.000Z' }, data: {} }),
      }) as any
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBackup),
      }) as any
    )
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin role', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { id: 'user-2', name: 'Member', role: 'member' } })
    const { POST } = await import('@/app/api/settings/backup/restore/route')
    const res = await POST(
      new Request('http://localhost/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBackup),
      }) as any
    )
    expect(res.status).toBe(403)
  })
})
