// src/tests/api/store.test.ts
import { vi, describe, it, expect } from 'vitest'

const mockSession = { user: { id: 'user-1', name: 'Franz' } }
const mockItem = { id: 'item-1', title: 'Putz-Profi', pointCost: 500, type: 'trophy', isActive: true }

vi.mock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(mockSession) }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeItem: {
      findMany: vi.fn().mockResolvedValue([mockItem]),
      findUnique: vi.fn().mockResolvedValue(mockItem),
    },
    taskCompletion: {
      findMany: vi.fn().mockResolvedValue([{ points: 1000 }]),
    },
    purchase: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'pur-1', pointsSpent: 500 }),
      findUnique: vi.fn().mockResolvedValue({ id: 'pur-1', userId: 'user-1', redeemedAt: null }),
      update: vi.fn().mockResolvedValue({ id: 'pur-1', redeemedAt: new Date() }),
    },
  },
}))

describe('GET /api/store', () => {
  it('returns store items', async () => {
    const { GET } = await import('@/app/api/store/route')
    const res = await GET(new Request('http://localhost/api/store') as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/store/[id]/purchase', () => {
  it('returns 201 on successful purchase', async () => {
    const { POST } = await import('@/app/api/store/[id]/purchase/route')
    const res = await POST(
      new Request('http://localhost/api/store/item-1/purchase', { method: 'POST' }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(201)
  })
})
