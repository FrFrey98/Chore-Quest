import { vi, describe, it, expect } from 'vitest'

const { mockMkdir, mockWriteFile, mockReaddir, mockUnlink } = vi.hoisted(() => ({
  mockMkdir: vi.fn().mockResolvedValue(undefined),
  mockWriteFile: vi.fn().mockResolvedValue(undefined),
  mockReaddir: vi.fn().mockResolvedValue(['pre-restore-old1.json', 'pre-restore-old2.json']),
  mockUnlink: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('fs/promises', () => ({
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  readdir: (...args: unknown[]) => mockReaddir(...args),
  unlink: (...args: unknown[]) => mockUnlink(...args),
}))

const mockUsers = [
  { id: 'u1', name: 'Alice', pin: '$2a$10$hash', role: 'admin', createdAt: new Date('2026-01-01'), notificationsEnabled: false, installPromptDismissed: false },
]
const mockCategories = [{ id: 'c1', name: 'Küche', emoji: '🍳' }]

vi.mock('@/lib/prisma', () => {
  const makeModel = (data: unknown[] = []) => ({
    findMany: vi.fn().mockResolvedValue(data),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
  })

  return {
    prisma: {
      user: makeModel(mockUsers),
      category: makeModel(mockCategories),
      task: makeModel(),
      taskCompletion: makeModel(),
      taskApproval: makeModel(),
      storeItem: makeModel(),
      purchase: makeModel(),
      achievement: makeModel(),
      userAchievement: makeModel(),
      streakState: makeModel(),
      appConfig: makeModel(),
      taskScheduleOverride: makeModel(),
      pushSubscription: makeModel(),
      $queryRaw: vi.fn().mockResolvedValue([]),
      $executeRaw: vi.fn().mockResolvedValue(0),
      $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
        const { prisma } = await import('@/lib/prisma')
        return fn(prisma)
      }),
    },
  }
})

describe('exportAllData', () => {
  it('returns structured backup with meta and all tables', async () => {
    const { exportAllData } = await import('@/lib/backup')
    const result = await exportAllData()

    expect(result.meta).toBeDefined()
    expect(result.meta.version).toBe(1)
    expect(result.meta.exportedAt).toBeDefined()
    expect(result.data.users).toEqual(mockUsers)
    expect(result.data.categories).toEqual(mockCategories)
    expect(result.data.tasks).toEqual([])
    expect(result.data.taskCompletions).toEqual([])
    expect(result.data.taskApprovals).toEqual([])
    expect(result.data.storeItems).toEqual([])
    expect(result.data.purchases).toEqual([])
    expect(result.data.achievements).toEqual([])
    expect(result.data.userAchievements).toEqual([])
    expect(result.data.streakStates).toEqual([])
    expect(result.data.appConfigs).toEqual([])
    expect(result.data.taskScheduleOverrides).toEqual([])
    expect(result.data.pushSubscriptions).toEqual([])
  })
})

describe('validateBackup', () => {
  it('accepts valid backup data', async () => {
    const { validateBackup, exportAllData } = await import('@/lib/backup')
    const backup = await exportAllData()
    const result = validateBackup(backup)
    expect(result.valid).toBe(true)
  })

  it('rejects null input', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup(null)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('Ungültiges JSON')
  })

  it('rejects missing meta', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup({ data: {} })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('Meta-Daten')
  })

  it('rejects wrong version', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup({ meta: { version: 999 }, data: {} })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('Inkompatible Version')
  })

  it('rejects missing table', async () => {
    const { validateBackup } = await import('@/lib/backup')
    const result = validateBackup({
      meta: { version: 1, exportedAt: '', appVersion: '1.0.0' },
      data: { users: [] },
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('fehlt')
  })
})

describe('restoreAllData', () => {
  it('calls deleteMany and createMany in transaction', async () => {
    const { restoreAllData } = await import('@/lib/backup')
    const { prisma } = await import('@/lib/prisma')

    const backup = {
      meta: { version: 1, exportedAt: '2026-04-07T00:00:00Z', appVersion: '1.0.0' },
      data: {
        users: [{ id: 'u1', name: 'Alice', pin: '$2a$10$hash', role: 'admin', createdAt: '2026-01-01T00:00:00Z', notificationsEnabled: false, installPromptDismissed: false }],
        categories: [], tasks: [], taskCompletions: [], taskApprovals: [],
        storeItems: [], purchases: [], achievements: [], userAchievements: [],
        streakStates: [], appConfigs: [], taskScheduleOverrides: [], pushSubscriptions: [],
        taskAssignments: [],
      },
    }

    await restoreAllData(backup as any)

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.user.deleteMany).toHaveBeenCalled()
    expect(prisma.user.createMany).toHaveBeenCalledWith({ data: backup.data.users })
  })
})

describe('createPreRestoreBackup', () => {
  it('writes backup JSON and returns filepath', async () => {
    const { createPreRestoreBackup } = await import('@/lib/backup')
    const path = await createPreRestoreBackup()

    expect(path).toMatch(/\/app\/data\/backups\/pre-restore-.*\.json$/)
    expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('backups'), { recursive: true })
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringMatching(/pre-restore-.*\.json$/),
      expect.any(String),
      'utf-8'
    )
  })

  it('cleans up old backups keeping max 5', async () => {
    mockReaddir.mockResolvedValueOnce([
      'pre-restore-2026-01-01.json',
      'pre-restore-2026-01-02.json',
      'pre-restore-2026-01-03.json',
      'pre-restore-2026-01-04.json',
      'pre-restore-2026-01-05.json',
      'pre-restore-2026-01-06.json',
    ])

    const { createPreRestoreBackup } = await import('@/lib/backup')
    await createPreRestoreBackup()

    expect(mockUnlink).toHaveBeenCalledTimes(1)
    expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining('pre-restore-2026-01-01.json'))
  })
})
