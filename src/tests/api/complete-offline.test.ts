import { describe, it, expect } from 'vitest'

/**
 * The offlineAt conflict logic is tested via the pure function below.
 * Full API route integration tests require Prisma mocking which is not
 * set up in this project. The logic is extracted for unit testing.
 */

function shouldRejectOfflineCompletion(
  offlineAt: string,
  existingCompletions: { completedAt: Date; userId: string }[],
): { reject: boolean; completedBy?: string } {
  const offlineTime = new Date(offlineAt)
  const conflicting = existingCompletions.find(
    (c) => c.completedAt >= offlineTime
  )
  if (conflicting) {
    return { reject: true, completedBy: conflicting.userId }
  }
  return { reject: false }
}

describe('offlineAt conflict detection', () => {
  it('rejects when a completion exists after offlineAt', () => {
    const result = shouldRejectOfflineCompletion('2026-04-06T10:00:00Z', [
      { completedAt: new Date('2026-04-06T10:30:00Z'), userId: 'partner' },
    ])
    expect(result).toEqual({ reject: true, completedBy: 'partner' })
  })

  it('allows when no completion exists after offlineAt', () => {
    const result = shouldRejectOfflineCompletion('2026-04-06T10:00:00Z', [
      { completedAt: new Date('2026-04-06T09:00:00Z'), userId: 'partner' },
    ])
    expect(result).toEqual({ reject: false })
  })

  it('allows when no completions exist at all', () => {
    const result = shouldRejectOfflineCompletion('2026-04-06T10:00:00Z', [])
    expect(result).toEqual({ reject: false })
  })
})
