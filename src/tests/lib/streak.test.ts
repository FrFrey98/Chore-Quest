import { describe, it, expect } from 'vitest'
import {
  STREAK_TIERS,
  getStreakTier,
  applyBonus,
  calculateRestorePrice,
  getNextTier,
} from '@/lib/streak'

describe('getStreakTier', () => {
  it('returns no bonus for streak 0', () => {
    const tier = getStreakTier(0)
    expect(tier.percent).toBe(0)
    expect(tier.name).toBe('Kein Bonus')
  })

  it('returns no bonus for streak 2', () => {
    expect(getStreakTier(2).percent).toBe(0)
  })

  it('returns 5% for streak 3 (Warm-up)', () => {
    const tier = getStreakTier(3)
    expect(tier.percent).toBe(5)
    expect(tier.name).toBe('Warm-up')
  })

  it('returns 5% for streak 6', () => {
    expect(getStreakTier(6).percent).toBe(5)
  })

  it('returns 10% for streak 7 (Feuer-Starter)', () => {
    const tier = getStreakTier(7)
    expect(tier.percent).toBe(10)
    expect(tier.name).toBe('Feuer-Starter')
  })

  it('returns 10% for streak 13', () => {
    expect(getStreakTier(13).percent).toBe(10)
  })

  it('returns 25% for streak 14 (Wochen-Star)', () => {
    const tier = getStreakTier(14)
    expect(tier.percent).toBe(25)
    expect(tier.name).toBe('Wochen-Star')
  })

  it('returns 50% for streak 30 (Monats-Marathon)', () => {
    const tier = getStreakTier(30)
    expect(tier.percent).toBe(50)
    expect(tier.name).toBe('Monats-Marathon')
  })

  it('returns 50% for streak 100', () => {
    expect(getStreakTier(100).percent).toBe(50)
  })
})

describe('applyBonus', () => {
  it('returns base points when no bonus (streak 0)', () => {
    expect(applyBonus(20, 0)).toBe(20)
  })

  it('applies 5% bonus and floors the result', () => {
    expect(applyBonus(20, 3)).toBe(21)
  })

  it('applies 10% bonus', () => {
    expect(applyBonus(20, 7)).toBe(22)
  })

  it('applies 25% bonus', () => {
    expect(applyBonus(20, 14)).toBe(25)
  })

  it('applies 50% bonus', () => {
    expect(applyBonus(20, 30)).toBe(30)
  })

  it('floors fractional points', () => {
    expect(applyBonus(15, 3)).toBe(15)
  })

  it('floors 10% on odd base points', () => {
    expect(applyBonus(25, 7)).toBe(27)
  })

  // Teamwork bonus tests
  it('applies 10% teamwork bonus when shared, no streak', () => {
    expect(applyBonus(20, 0, true)).toBe(22)
  })

  it('applies teamwork + streak bonus additively (5% + 10%)', () => {
    // 35 * 1.15 = 40.25 → 40
    expect(applyBonus(35, 3, true)).toBe(40)
  })

  it('applies teamwork + streak bonus additively (10% + 10%)', () => {
    // 35 * 1.20 = 42
    expect(applyBonus(35, 7, true)).toBe(42)
  })

  it('applies teamwork + streak bonus additively (25% + 10%)', () => {
    // 20 * 1.35 = 27
    expect(applyBonus(20, 14, true)).toBe(27)
  })

  it('applies teamwork + streak bonus additively (50% + 10%)', () => {
    // 20 * 1.60 = 32
    expect(applyBonus(20, 30, true)).toBe(32)
  })

  it('isShared defaults to false', () => {
    expect(applyBonus(20, 7)).toBe(applyBonus(20, 7, false))
  })
})

describe('calculateRestorePrice', () => {
  it('returns 20 + 5 * streak', () => {
    expect(calculateRestorePrice(7)).toBe(55)
  })

  it('returns 90 for streak 14', () => {
    expect(calculateRestorePrice(14)).toBe(90)
  })

  it('returns 170 for streak 30', () => {
    expect(calculateRestorePrice(30)).toBe(170)
  })

  it('returns 25 for streak 1', () => {
    expect(calculateRestorePrice(1)).toBe(25)
  })
})

describe('getNextTier', () => {
  it('returns Warm-up tier for streak 0', () => {
    const result = getNextTier(0)
    expect(result).not.toBeNull()
    expect(result!.tier.name).toBe('Warm-up')
    expect(result!.daysNeeded).toBe(3)
  })

  it('returns Feuer-Starter for streak 5', () => {
    const result = getNextTier(5)
    expect(result!.tier.name).toBe('Feuer-Starter')
    expect(result!.daysNeeded).toBe(2)
  })

  it('returns Wochen-Star for streak 7', () => {
    const result = getNextTier(7)
    expect(result!.tier.name).toBe('Wochen-Star')
    expect(result!.daysNeeded).toBe(7)
  })

  it('returns Monats-Marathon for streak 14', () => {
    const result = getNextTier(14)
    expect(result!.tier.name).toBe('Monats-Marathon')
    expect(result!.daysNeeded).toBe(16)
  })

  it('returns null for streak 30 (max tier)', () => {
    expect(getNextTier(30)).toBeNull()
  })

  it('returns null for streak 100', () => {
    expect(getNextTier(100)).toBeNull()
  })
})
