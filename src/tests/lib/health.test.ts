import { describe, it, expect } from 'vitest'
import { calculateHealth, getDecayHours, applyPointDecay, getHealthColor, shouldPulse } from '@/lib/health'

describe('calculateHealth', () => {
  it('returns 1 when not yet due', () => {
    const future = new Date(Date.now() + 3600000)
    expect(calculateHealth(future, 48)).toBe(1)
  })

  it('returns 1 when exactly at due time', () => {
    const now = new Date()
    expect(calculateHealth(now, 48, now)).toBe(1)
  })

  it('returns 0.5 when half decayed', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 24 * 3600000)
    expect(calculateHealth(dueDate, 48, now)).toBeCloseTo(0.5)
  })

  it('returns 0 when fully decayed', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 48 * 3600000)
    expect(calculateHealth(dueDate, 48, now)).toBe(0)
  })

  it('returns 0 when past decay window', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 100 * 3600000)
    expect(calculateHealth(dueDate, 48, now)).toBe(0)
  })

  it('returns 1 when nextDueAt is null', () => {
    expect(calculateHealth(null, 48)).toBe(1)
  })

  it('handles string dates', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 24 * 3600000)
    expect(calculateHealth(dueDate.toISOString(), 48, now)).toBeCloseTo(0.5)
  })

  it('pauses decay during vacation (full overlap)', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 48 * 3600000) // 48h ago
    // Without vacation: fully decayed
    expect(calculateHealth(dueDate, 48, now)).toBe(0)
    // With vacation covering the entire period: no decay
    const vStart = new Date(dueDate.getTime())
    const vEnd = new Date(now.getTime())
    expect(calculateHealth(dueDate, 48, now, vStart, vEnd)).toBe(1)
  })

  it('pauses decay during vacation (partial overlap)', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 48 * 3600000) // 48h ago
    // Vacation covers 24h of the 48h period
    const vStart = new Date(dueDate.getTime())
    const vEnd = new Date(dueDate.getTime() + 24 * 3600000)
    // Effective elapsed = 48 - 24 = 24h, health = 1 - 24/48 = 0.5
    expect(calculateHealth(dueDate, 48, now, vStart, vEnd)).toBeCloseTo(0.5)
  })

  it('ignores vacation that does not overlap with decay window', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 24 * 3600000)
    // Vacation was a week ago
    const vStart = new Date(now.getTime() - 14 * 24 * 3600000)
    const vEnd = new Date(now.getTime() - 7 * 24 * 3600000)
    expect(calculateHealth(dueDate, 48, now, vStart, vEnd)).toBeCloseTo(0.5)
  })

  it('handles ongoing vacation (no vacationEnd)', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 24 * 3600000) // 24h ago
    // Vacation started at due date, still ongoing
    const vStart = new Date(dueDate.getTime())
    expect(calculateHealth(dueDate, 48, now, vStart, null)).toBe(1)
  })

  it('accepts string vacation dates', () => {
    const now = new Date()
    const dueDate = new Date(now.getTime() - 48 * 3600000)
    const vStart = new Date(dueDate.getTime()).toISOString()
    const vEnd = new Date(now.getTime()).toISOString()
    expect(calculateHealth(dueDate, 48, now, vStart, vEnd)).toBe(1)
  })
})

describe('getDecayHours', () => {
  const defaults = { daily: 48, weekly: 168, monthly: 336 }

  it('uses task-level override when set', () => {
    expect(getDecayHours(72, 'daily', defaults)).toBe(72)
  })

  it('uses interval default when no override', () => {
    expect(getDecayHours(null, 'daily', defaults)).toBe(48)
    expect(getDecayHours(null, 'weekly', defaults)).toBe(168)
  })

  it('falls back to 48 for unknown interval', () => {
    expect(getDecayHours(null, 'custom', defaults)).toBe(48)
  })
})

describe('applyPointDecay', () => {
  it('returns full points at health 1.0', () => {
    expect(applyPointDecay(10, 1.0)).toBe(10)
  })

  it('returns half points at health 0.5', () => {
    expect(applyPointDecay(10, 0.5)).toBe(5)
  })

  it('returns minimum 1 point', () => {
    expect(applyPointDecay(10, 0)).toBe(1)
    expect(applyPointDecay(1, 0.01)).toBe(1)
  })
})

describe('getHealthColor', () => {
  it('returns success above 50%', () => {
    expect(getHealthColor(0.8)).toBe('bg-success')
  })
  it('returns warning between 25-50%', () => {
    expect(getHealthColor(0.3)).toBe('bg-warning')
  })
  it('returns danger below 25%', () => {
    expect(getHealthColor(0.15)).toBe('bg-danger')
  })
  it('returns danger at 0', () => {
    expect(getHealthColor(0)).toBe('bg-danger')
  })
})

describe('shouldPulse', () => {
  it('pulses at 10% or below', () => {
    expect(shouldPulse(0.1)).toBe(true)
    expect(shouldPulse(0.05)).toBe(true)
  })
  it('does not pulse above 10%', () => {
    expect(shouldPulse(0.2)).toBe(false)
  })
  it('does not pulse at 0', () => {
    expect(shouldPulse(0)).toBe(false)
  })
})
