import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockSession = { user: { id: 'user-1', name: 'Franz' } }
const mockTask = {
  id: 'task-1',
  title: 'Abwasch',
  emoji: '🍽️',
  points: 30,
  isRecurring: false,
  recurringInterval: null,
  status: 'active',
  categoryId: 'cat-kitchen',
  createdById: 'user-1',
  nextDueAt: null,
  category: { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
}

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue(mockSession),
}))

vi.mock('@/lib/auth', () => ({ authOptions: {} }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn().mockImplementation((cb: any) =>
      cb({
        task: { create: vi.fn().mockResolvedValue(mockTask) },
        taskApproval: { create: vi.fn().mockResolvedValue({ id: 'approval-1' }) },
      })
    ),
    task: {
      findMany: vi.fn().mockResolvedValue([mockTask]),
      create: vi.fn().mockResolvedValue(mockTask),
      findUnique: vi.fn().mockResolvedValue(mockTask),
      update: vi.fn().mockResolvedValue({ ...mockTask, status: 'archived' }),
    },
    taskApproval: {
      create: vi.fn().mockResolvedValue({ id: 'approval-1' }),
    },
    taskCompletion: {
      create: vi.fn().mockResolvedValue({ id: 'comp-1', points: 30 }),
    },
  },
}))

describe('GET /api/tasks', () => {
  it('returns 200 with task list', async () => {
    const { GET } = await import('@/app/api/tasks/route')
    const req = new Request('http://localhost/api/tasks')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/tasks', () => {
  it('returns 201 when task is created', async () => {
    const { POST } = await import('@/app/api/tasks/route')
    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Abwasch',
        emoji: '🍽️',
        points: 30,
        categoryId: 'cat-kitchen',
        isRecurring: false,
      }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
  })
})
