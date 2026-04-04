import { vi, describe, it, expect } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'seed-user-2', name: 'Bob' } }),
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    taskApproval: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'approval-1',
        taskId: 'task-1',
        requestedById: 'seed-user-1',
        status: 'pending',
      }),
      update: vi.fn().mockResolvedValue({ id: 'approval-1', status: 'approved' }),
    },
    task: {
      update: vi.fn().mockResolvedValue({ id: 'task-1', status: 'active' }),
    },
    $transaction: vi.fn().mockImplementation((callback: any) =>
      callback({
        taskApproval: { update: vi.fn().mockResolvedValue({ id: 'approval-1', status: 'approved' }) },
        task: { update: vi.fn().mockResolvedValue({ id: 'task-1', status: 'active' }) },
      })
    ),
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

  it('returns 401 when not authenticated', async () => {
    // Temporarily mock getServerSession to return null for this test
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid action', async () => {
    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'invalid' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(400)
  })

  it('returns 403 when user tries to approve their own task', async () => {
    // seed-user-1 is the session user, but requestedById is also seed-user-1
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { id: 'seed-user-1', name: 'Alice' } })

    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/approval-1', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    })
    const res = await POST(req as any, { params: { id: 'approval-1' } })
    expect(res.status).toBe(403)
  })

  it('returns 404 when approval not found', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.taskApproval.findUnique).mockResolvedValueOnce(null)

    const { POST } = await import('@/app/api/approvals/[id]/route')
    const req = new Request('http://localhost/api/approvals/nonexistent', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    })
    const res = await POST(req as any, { params: { id: 'nonexistent' } })
    expect(res.status).toBe(404)
  })
})
