// src/tests/api/store.test.ts
import { vi, describe, it, expect } from 'vitest'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

const mockSession = { user: { id: 'seed-user-1', name: 'Alice' } }
const mockItem = { id: 'item-1', title: 'Putz-Profi', pointCost: 500, type: 'real_reward', isActive: true }

vi.mock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'seed-user-1', name: 'Alice' } }) }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => {
  const mock = {
    storeItem: {
      findMany: vi.fn().mockResolvedValue([{ id: 'item-1', title: 'Putz-Profi', pointCost: 500, type: 'real_reward', isActive: true }]),
      findUnique: vi.fn().mockResolvedValue({ id: 'item-1', title: 'Putz-Profi', pointCost: 500, type: 'real_reward', isActive: true }),
    },
    taskCompletion: {
      findMany: vi.fn().mockResolvedValue([{ points: 1000 }]),
    },
    purchase: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'pur-1', pointsSpent: 500 }),
      findUnique: vi.fn().mockResolvedValue({ id: 'pur-1', userId: 'seed-user-1', redeemedAt: null }),
      update: vi.fn().mockResolvedValue({ id: 'pur-1', redeemedAt: new Date() }),
    },
    $transaction: vi.fn(),
  }
  mock.$transaction.mockImplementation((fn: (tx: typeof mock) => Promise<unknown>) => fn(mock))
  return { prisma: mock }
})

describe('GET /api/store', () => {
  it('returns store items', async () => {
    const { GET } = await import('@/app/api/store/route')
    const res = await GET(new Request('http://localhost/api/store') as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  it('returns 401 when session is null', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { GET } = await import('@/app/api/store/route')
    const res = await GET(new Request('http://localhost/api/store') as any)
    expect(res.status).toBe(401)
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

  it('returns 401 when session is null', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/store/[id]/purchase/route')
    const res = await POST(
      new Request('http://localhost/api/store/item-1/purchase', { method: 'POST' }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(401)
  })

  it('returns 402 when insufficient points', async () => {
    // earned 1000, spent 600 => balance 400 < 500 cost
    vi.mocked(prisma.taskCompletion.findMany).mockResolvedValueOnce([{ points: 1000 }] as any)
    vi.mocked(prisma.purchase.findMany).mockResolvedValueOnce([{ pointsSpent: 600 }] as any)
    const { POST } = await import('@/app/api/store/[id]/purchase/route')
    const res = await POST(
      new Request('http://localhost/api/store/item-1/purchase', { method: 'POST' }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(402)
  })
})

describe('POST /api/store/[id]/redeem', () => {
  it('returns 200 on successful self-redeem', async () => {
    const { POST } = await import('@/app/api/store/[id]/redeem/route')
    const res = await POST(
      new Request('http://localhost/api/store/pur-1/redeem', { method: 'POST' }) as any,
      { params: { id: 'pur-1' } }
    )
    expect(res.status).toBe(200)
  })

  it('returns 401 when session is null', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/store/[id]/redeem/route')
    const res = await POST(
      new Request('http://localhost/api/store/pur-1/redeem', { method: 'POST' }) as any,
      { params: { id: 'pur-1' } }
    )
    expect(res.status).toBe(401)
  })

  it('returns 409 when already redeemed', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValueOnce({
      id: 'pur-1',
      userId: 'seed-user-1',
      redeemedAt: new Date('2024-01-01'),
    } as any)
    const { POST } = await import('@/app/api/store/[id]/redeem/route')
    const res = await POST(
      new Request('http://localhost/api/store/pur-1/redeem', { method: 'POST' }) as any,
      { params: { id: 'pur-1' } }
    )
    expect(res.status).toBe(409)
  })

  it('returns 403 when trying to redeem someone else\'s purchase', async () => {
    vi.mocked(prisma.purchase.findUnique).mockResolvedValueOnce({
      id: 'pur-1',
      userId: 'user-other',
      redeemedAt: null,
    } as any)
    const { POST } = await import('@/app/api/store/[id]/redeem/route')
    const res = await POST(
      new Request('http://localhost/api/store/pur-1/redeem', { method: 'POST' }) as any,
      { params: { id: 'pur-1' } }
    )
    expect(res.status).toBe(403)
  })
})
