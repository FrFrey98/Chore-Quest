import { vi, describe, it, expect } from 'vitest'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'seed-user-1', name: 'Alice' } }) }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    achievement: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'ach-1', title: 'Erste Schritte', description: 'Erste Aufgabe erledigt', emoji: '⭐', conditionType: 'task_count', conditionValue: 1, conditionMeta: null, sortOrder: 1 },
        { id: 'ach-2', title: 'Putz-Profi', description: '50 Aufgaben erledigt', emoji: '🧹', conditionType: 'task_count', conditionValue: 50, conditionMeta: null, sortOrder: 2 },
      ]),
    },
    userAchievement: {
      findMany: vi.fn().mockResolvedValue([
        { achievementId: 'ach-1', unlockedAt: new Date('2026-03-01') },
      ]),
    },
  },
}))
vi.mock('@/lib/achievements', () => ({
  computeStats: vi.fn().mockResolvedValue({
    totalTaskCount: 1,
    categoryCounts: { 'cat-kitchen': 1 },
    currentStreakDays: 1,
    totalPointsEarned: 30,
    currentLevel: 1,
  }),
}))

describe('GET /api/achievements', () => {
  it('returns achievements with progress', async () => {
    const { GET } = await import('@/app/api/achievements/route')
    const res = await GET(new Request('http://localhost/api/achievements') as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.achievements).toHaveLength(2)
    expect(data.achievements[0].unlocked).toBe(true)
    expect(data.achievements[1].unlocked).toBe(false)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { GET } = await import('@/app/api/achievements/route')
    const res = await GET(new Request('http://localhost/api/achievements') as any)
    expect(res.status).toBe(401)
  })
})
