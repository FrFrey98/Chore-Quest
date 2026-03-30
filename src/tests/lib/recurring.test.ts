import { describe, it, expect } from 'vitest'
import { getNextDueAt, isTaskVisible } from '@/lib/recurring'

describe('getNextDueAt', () => {
  const base = new Date('2026-04-01T10:00:00Z')

  it('adds 1 day for daily', () => {
    const next = getNextDueAt('daily', base)
    expect(next.toISOString()).toBe('2026-04-02T10:00:00.000Z')
  })

  it('adds 7 days for weekly', () => {
    const next = getNextDueAt('weekly', base)
    expect(next.toISOString()).toBe('2026-04-08T10:00:00.000Z')
  })

  it('adds 30 days for monthly', () => {
    const next = getNextDueAt('monthly', base)
    expect(next.toISOString()).toBe('2026-05-01T10:00:00.000Z')
  })
})

describe('isTaskVisible', () => {
  const now = new Date('2026-04-05T12:00:00Z')

  it('shows one-time tasks without nextDueAt', () => {
    expect(isTaskVisible({ isRecurring: false, nextDueAt: null }, now)).toBe(true)
  })

  it('shows recurring tasks when nextDueAt is in the past', () => {
    const past = new Date('2026-04-04T00:00:00Z')
    expect(isTaskVisible({ isRecurring: true, nextDueAt: past }, now)).toBe(true)
  })

  it('hides recurring tasks when nextDueAt is in the future', () => {
    const future = new Date('2026-04-10T00:00:00Z')
    expect(isTaskVisible({ isRecurring: true, nextDueAt: future }, now)).toBe(false)
  })

  it('shows recurring tasks without nextDueAt (never completed)', () => {
    expect(isTaskVisible({ isRecurring: true, nextDueAt: null }, now)).toBe(true)
  })
})
