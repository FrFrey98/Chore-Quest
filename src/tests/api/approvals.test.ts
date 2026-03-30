import { vi, describe, it, expect } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-2', name: 'Partner' } }),
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    taskApproval: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'approval-1',
        taskId: 'task-1',
        requestedById: 'user-1',
        status: 'pending',
      }),
      update: vi.fn().mockResolvedValue({ id: 'approval-1', status: 'approved' }),
    },
    task: {
      update: vi.fn().mockResolvedValue({ id: 'task-1', status: 'active' }),
    },
  },
}))

describe('POST /api/approvals/[id]', () => {
  it('approves a pending approval', async () => {
    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(200)
  })

  it('rejects a pending approval', async () => {
    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'reject' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(200)
  })
})
