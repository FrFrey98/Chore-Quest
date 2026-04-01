import { vi, describe, it, expect } from 'vitest'
import { getServerSession } from 'next-auth'

const mockItem = {
  id: 'item-1',
  title: 'Kinoabend',
  emoji: '🎬',
  description: 'Gemeinsamer Kinobesuch',
  pointCost: 500,
  type: 'real_reward',
  isActive: true,
}

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-1', name: 'Franz' } }),
}))

vi.mock('@/lib/auth', () => ({ authOptions: {} }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    storeItem: {
      update: vi.fn().mockResolvedValue({ ...mockItem, title: 'Updated' }),
    },
  },
}))

describe('PATCH /api/store/[id]', () => {
  it('returns 200 with updated item', async () => {
    const { PATCH } = await import('@/app/api/store/[id]/route')
    const res = await PATCH(
      new Request('http://localhost/api/store/item-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Updated')
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { PATCH } = await import('@/app/api/store/[id]/route')
    const res = await PATCH(
      new Request('http://localhost/api/store/item-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 when item not found', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.storeItem.update).mockRejectedValueOnce({ code: 'P2025' })
    const { PATCH } = await import('@/app/api/store/[id]/route')
    const res = await PATCH(
      new Request('http://localhost/api/store/item-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/store/[id]', () => {
  it('returns 204 on soft delete', async () => {
    const { DELETE } = await import('@/app/api/store/[id]/route')
    const res = await DELETE(
      new Request('http://localhost/api/store/item-1', { method: 'DELETE' }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(204)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const { DELETE } = await import('@/app/api/store/[id]/route')
    const res = await DELETE(
      new Request('http://localhost/api/store/item-1', { method: 'DELETE' }) as any,
      { params: { id: 'item-1' } }
    )
    expect(res.status).toBe(401)
  })
})
