import { vi, describe, it, expect } from 'vitest'

const mockUsers = [
  { id: 'u1', name: 'Alice', pin: '$2a$10$hash', role: 'admin', createdAt: new Date('2026-01-01'), notificationsEnabled: false, installPromptDismissed: false },
]
const mockCategories = [{ id: 'c1', name: 'Küche', emoji: '🍳' }]

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: vi.fn().mockResolvedValue(mockUsers) },
    category: { findMany: vi.fn().mockResolvedValue(mockCategories) },
    task: { findMany: vi.fn().mockResolvedValue([]) },
    taskCompletion: { findMany: vi.fn().mockResolvedValue([]) },
    taskApproval: { findMany: vi.fn().mockResolvedValue([]) },
    storeItem: { findMany: vi.fn().mockResolvedValue([]) },
    purchase: { findMany: vi.fn().mockResolvedValue([]) },
    achievement: { findMany: vi.fn().mockResolvedValue([]) },
    userAchievement: { findMany: vi.fn().mockResolvedValue([]) },
    streakState: { findMany: vi.fn().mockResolvedValue([]) },
    appConfig: { findMany: vi.fn().mockResolvedValue([]) },
    taskScheduleOverride: { findMany: vi.fn().mockResolvedValue([]) },
    pushSubscription: { findMany: vi.fn().mockResolvedValue([]) },
  },
}))

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
