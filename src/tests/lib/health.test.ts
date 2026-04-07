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
  it('returns green above 50%', () => {
    expect(getHealthColor(0.8)).toBe('bg-green-500')
  })
  it('returns yellow between 25-50%', () => {
    expect(getHealthColor(0.3)).toBe('bg-yellow-500')
  })
  it('returns red below 25%', () => {
    expect(getHealthColor(0.15)).toBe('bg-red-500')
  })
  it('returns dark red at 0', () => {
    expect(getHealthColor(0)).toBe('bg-red-600')
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
