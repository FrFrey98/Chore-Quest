import { describe, it, expect } from 'vitest'
import { getNextDueAt, getNextDueAtForDays, isTaskVisible } from '@/lib/recurring'

describe('getNextDueAt', () => {
  const base = new Date('2026-04-01T10:00:00Z')

  it('adds 1 day for daily, starting at midnight UTC', () => {
    const next = getNextDueAt('daily', base)
    expect(next!.toISOString()).toBe('2026-04-02T00:00:00.000Z')
  })

  it('adds 7 days for weekly, starting at midnight UTC', () => {
    const next = getNextDueAt('weekly', base)
    expect(next!.toISOString()).toBe('2026-04-08T00:00:00.000Z')
  })

  it('adds 30 days for monthly, starting at midnight UTC', () => {
    const next = getNextDueAt('monthly', base)
    expect(next!.toISOString()).toBe('2026-05-01T00:00:00.000Z')
  })

  it('respects custom intervals', () => {
    const base = new Date('2025-01-01T15:30:00Z')
    const custom = { biweekly: 14 }
    const next = getNextDueAt('biweekly', base, custom)
    expect(next!.toISOString()).toBe('2025-01-15T00:00:00.000Z')
  })

  it('task completed late evening reappears at midnight next day', () => {
    const lateEvening = new Date('2026-04-01T23:30:00Z')
    const next = getNextDueAt('daily', lateEvening)
    expect(next!.toISOString()).toBe('2026-04-02T00:00:00.000Z')
  })

  it('delegates to getNextDueAtForDays when scheduleDays is set', () => {
    // 2026-04-06 is a Monday; asking for "wed" should yield 2026-04-08
    const from = new Date('2026-04-06T00:00:00Z')
    const next = getNextDueAt('weekly', from, undefined, { scheduleDays: 'wed' })
    expect(next!.toISOString()).toBe('2026-04-08T00:00:00.000Z')
  })

  it('falls back to interval logic when scheduleDays is null', () => {
    const from = new Date('2026-04-06T00:00:00Z')
    const next = getNextDueAt('daily', from, undefined, { scheduleDays: null })
    expect(next!.toISOString()).toBe('2026-04-07T00:00:00.000Z')
  })
})

describe('getNextDueAtForDays', () => {
  it('finds next Monday from a Sunday', () => {
    // 2026-04-05 is a Sunday
    const from = new Date('2026-04-05T00:00:00Z')
    const next = getNextDueAtForDays('mon', from)
    expect(next!.toISOString()).toBe('2026-04-06T00:00:00.000Z')
  })

  it('finds next Wednesday from a Monday', () => {
    // 2026-04-06 is a Monday
    const from = new Date('2026-04-06T00:00:00Z')
    const next = getNextDueAtForDays('wed', from)
    expect(next!.toISOString()).toBe('2026-04-08T00:00:00.000Z')
  })

  it('wraps around to next week', () => {
    // 2026-04-08 is a Wednesday; next Monday is 2026-04-13
    const from = new Date('2026-04-08T00:00:00Z')
    const next = getNextDueAtForDays('mon', from)
    expect(next!.toISOString()).toBe('2026-04-13T00:00:00.000Z')
  })

  it('handles multiple days and picks the nearest', () => {
    // 2026-04-06 Mon; "wed,fri" → nearest is Wed 2026-04-08
    const from = new Date('2026-04-06T00:00:00Z')
    const next = getNextDueAtForDays('wed,fri', from)
    expect(next!.toISOString()).toBe('2026-04-08T00:00:00.000Z')
  })

  it('handles all seven days (daily equivalent)', () => {
    // 2026-04-06 Mon; every day → next is 2026-04-07
    const from = new Date('2026-04-06T00:00:00Z')
    const next = getNextDueAtForDays('mon,tue,wed,thu,fri,sat,sun', from)
    expect(next!.toISOString()).toBe('2026-04-07T00:00:00.000Z')
  })

  it('skips days with skip overrides', () => {
    // 2026-04-06 Mon; asking for "tue" but 2026-04-07 is skipped → falls to 2026-04-14
    const from = new Date('2026-04-06T00:00:00Z')
    const overrides = [{ date: '2026-04-07', type: 'skip' as const }]
    const next = getNextDueAtForDays('tue', from, overrides)
    expect(next!.toISOString()).toBe('2026-04-14T00:00:00.000Z')
  })

  it('includes add overrides that come before the next pattern day', () => {
    // 2026-04-06 Mon; pattern is "fri" (next: 2026-04-10); add override on 2026-04-08 → returns 2026-04-08
    const from = new Date('2026-04-06T00:00:00Z')
    const overrides = [{ date: '2026-04-08', type: 'add' as const }]
    const next = getNextDueAtForDays('fri', from, overrides)
    expect(next!.toISOString()).toBe('2026-04-08T00:00:00.000Z')
  })

  it('handles skip and add overrides together', () => {
    const from = new Date('2026-04-06T00:00:00Z')
    const overrides = [
      { date: '2026-04-07', type: 'skip' as const },
      { date: '2026-04-09', type: 'add' as const },
    ]
    const next = getNextDueAtForDays('tue', from, overrides)
    expect(next!.toISOString()).toBe('2026-04-09T00:00:00.000Z')
  })

  it('returns null if no day found within 8 weeks (empty scheduleDays)', () => {
    // Passing an unrecognised day key that maps to nothing → always null
    const from = new Date('2026-04-06T00:00:00Z')
    const next = getNextDueAtForDays('', from)
    expect(next).toBeNull()
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

  it('shows recurring tasks when nextDueAt equals now (exactly on time)', () => {
    expect(isTaskVisible({ isRecurring: true, nextDueAt: now }, now)).toBe(true)
  })
})
