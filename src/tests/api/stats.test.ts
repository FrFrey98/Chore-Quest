// src/tests/api/stats.test.ts
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-1', name: 'Franz' } }),
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    taskCompletion: {
      findMany: vi.fn().mockResolvedValue([
        { taskId: 'task-1', points: 50, completedAt: new Date('2026-04-01'),
          task: { title: 'Abwasch', emoji: '🍽️', categoryId: 'cat-1' },
          user: { id: 'user-1', name: 'Franz' } },
      ]),
    },
  },
}))

describe('GET /api/stats?tab=personal', () => {
  it('returns personal stats with streak and topTasks', async () => {
    const { GET } = await import('@/app/api/stats/route')
    const req = new Request('http://localhost/api/stats?tab=personal')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('topTasks')
    expect(data).toHaveProperty('heatmap')
    expect(data).toHaveProperty('streak')
  })
})

describe('GET /api/feed', () => {
  it('returns feed array', async () => {
    const { GET } = await import('@/app/api/feed/route')
    const res = await GET(new Request('http://localhost/api/feed') as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})
