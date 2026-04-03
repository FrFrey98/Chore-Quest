import { describe, it, expect } from 'vitest'
import {
  DEFAULT_STREAK_TIERS,
  DEFAULT_TEAMWORK_BONUS_PERCENT,
  DEFAULT_RESTORE_BASE_PRICE,
  DEFAULT_RESTORE_PER_DAY_PRICE,
  DEFAULT_LEVEL_DEFINITIONS,
  DEFAULT_RECURRING_INTERVALS,
} from '@/lib/config'

describe('config defaults', () => {
  it('has 5 streak tiers sorted by minDays descending', () => {
    expect(DEFAULT_STREAK_TIERS).toHaveLength(5)
    expect(DEFAULT_STREAK_TIERS[0].minDays).toBe(30)
    expect(DEFAULT_STREAK_TIERS[4].minDays).toBe(0)
  })

  it('has teamwork bonus of 10', () => {
    expect(DEFAULT_TEAMWORK_BONUS_PERCENT).toBe(10)
  })

  it('has restore base price of 20 and per-day of 5', () => {
    expect(DEFAULT_RESTORE_BASE_PRICE).toBe(20)
    expect(DEFAULT_RESTORE_PER_DAY_PRICE).toBe(5)
  })

  it('has 6 level definitions starting at 0', () => {
    expect(DEFAULT_LEVEL_DEFINITIONS).toHaveLength(6)
    expect(DEFAULT_LEVEL_DEFINITIONS[0].minPoints).toBe(0)
    expect(DEFAULT_LEVEL_DEFINITIONS[5].minPoints).toBe(4000)
  })

  it('has 3 recurring intervals', () => {
    expect(DEFAULT_RECURRING_INTERVALS).toEqual({ daily: 1, weekly: 7, monthly: 30 })
  })
})
