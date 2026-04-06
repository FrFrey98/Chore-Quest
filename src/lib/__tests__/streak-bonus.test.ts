import { describe, it, expect } from 'vitest'
import { applyBonus } from '@/lib/streak'

describe('applyBonus with multiple partners', () => {
  it('scales teamwork bonus by number of partners', () => {
    // 100 base, 0 streak, teamwork 10%, 3 participants (2 partners)
    const result = applyBonus(100, 0, 2, { tiers: [{ minDays: 0, percent: 0, name: 'None' }], teamworkPercent: 10 })
    // 10% * 2 partners = 20% bonus -> 120 points
    expect(result).toBe(120)
  })

  it('returns base points with no partners', () => {
    const result = applyBonus(100, 0, 0, { tiers: [{ minDays: 0, percent: 0, name: 'None' }], teamworkPercent: 10 })
    expect(result).toBe(100)
  })

  it('combines streak and teamwork bonus', () => {
    // 100 base, streak tier gives 10%, 1 partner with 10% teamwork = 20% total -> 120
    const result = applyBonus(100, 7, 1, { tiers: [{ minDays: 7, percent: 10, name: 'Hot' }, { minDays: 0, percent: 0, name: 'None' }], teamworkPercent: 10 })
    expect(result).toBe(120)
  })
})
