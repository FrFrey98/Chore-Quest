import { describe, it, expect } from 'vitest'
import {
  getStreakTier,
  applyBonus,
  calculateRestorePrice,
  getNextTier,
  getEffectiveStreak,
  recalculateStreakFromDates,
  toDateKey,
  effectiveGapDays,
} from '@/lib/streak'
import { DEFAULT_STREAK_TIERS } from '@/lib/config'

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
    expect(applyBonus(20, 0, 1)).toBe(22)
  })

  it('applies teamwork + streak bonus additively (5% + 10%)', () => {
    // 35 * 1.15 = 40.25 → 40
    expect(applyBonus(35, 3, 1)).toBe(40)
  })

  it('applies teamwork + streak bonus additively (10% + 10%)', () => {
    // 35 * 1.20 = 42
    expect(applyBonus(35, 7, 1)).toBe(42)
  })

  it('applies teamwork + streak bonus additively (25% + 10%)', () => {
    // 20 * 1.35 = 27
    expect(applyBonus(20, 14, 1)).toBe(27)
  })

  it('applies teamwork + streak bonus additively (50% + 10%)', () => {
    // 20 * 1.60 = 32
    expect(applyBonus(20, 30, 1)).toBe(32)
  })

  it('partnerCount defaults to 0', () => {
    expect(applyBonus(20, 7)).toBe(applyBonus(20, 7, 0))
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

describe('custom config parameters', () => {
  it('getStreakTier respects custom tiers', () => {
    const custom = [{ minDays: 5, percent: 99, name: 'Custom' }, { minDays: 0, percent: 0, name: 'None' }]
    expect(getStreakTier(5, custom).percent).toBe(99)
    expect(getStreakTier(4, custom).percent).toBe(0)
  })

  it('calculateRestorePrice respects custom opts', () => {
    expect(calculateRestorePrice(10, { basePrice: 50, perDayPrice: 2 })).toBe(70)
  })

  it('applyBonus respects custom teamworkPercent', () => {
    expect(applyBonus(100, 0, 1, { teamworkPercent: 20 })).toBe(120)
  })

  it('getNextTier respects custom tiers', () => {
    const custom = [{ minDays: 10, percent: 50, name: 'Top' }, { minDays: 0, percent: 0, name: 'Base' }]
    const result = getNextTier(5, custom)
    expect(result?.tier.name).toBe('Top')
    expect(result?.daysNeeded).toBe(5)
  })
})

describe('recalculateStreakFromDates', () => {
  function makeDateKeys(...daysAgo: number[]): string[] {
    return daysAgo.map((d) => {
      const date = new Date()
      date.setUTCDate(date.getUTCDate() - d)
      return toDateKey(date)
    })
  }

  it('returns 0 for empty dates', () => {
    expect(recalculateStreakFromDates([])).toBe(0)
  })

  it('returns 1 for only today', () => {
    const dates = makeDateKeys(0)
    expect(recalculateStreakFromDates(dates)).toBe(1)
  })

  it('returns 1 for only yesterday', () => {
    const dates = makeDateKeys(1)
    expect(recalculateStreakFromDates(dates)).toBe(1)
  })

  it('returns 2 for today and yesterday', () => {
    const dates = makeDateKeys(0, 1)
    expect(recalculateStreakFromDates(dates)).toBe(2)
  })

  it('returns 3 for three consecutive days ending today', () => {
    const dates = makeDateKeys(0, 1, 2)
    expect(recalculateStreakFromDates(dates)).toBe(3)
  })

  it('returns 1 for today with gap (no yesterday)', () => {
    const dates = makeDateKeys(0, 2, 3)
    expect(recalculateStreakFromDates(dates)).toBe(1)
  })

  it('returns 2 for yesterday and day before, no today', () => {
    const dates = makeDateKeys(1, 2)
    expect(recalculateStreakFromDates(dates)).toBe(2)
  })

  it('returns 0 for only 2 days ago (streak broken)', () => {
    const dates = makeDateKeys(2)
    expect(recalculateStreakFromDates(dates)).toBe(0)
  })

  it('handles duplicate dates', () => {
    const dates = makeDateKeys(0, 0, 1, 1, 2)
    expect(recalculateStreakFromDates(dates)).toBe(3)
  })
})

describe('effectiveGapDays', () => {
  it('returns raw gap when no vacation', () => {
    expect(effectiveGapDays('2026-04-01', '2026-04-05')).toBe(4)
  })

  it('returns raw gap when gap <= 1', () => {
    expect(effectiveGapDays('2026-04-04', '2026-04-05')).toBe(1)
  })

  it('subtracts vacation days from gap', () => {
    // 4-day gap, 2 vacation days in between
    const vacation = {
      vacationStart: new Date('2026-04-02T00:00:00Z'),
      vacationEnd: new Date('2026-04-03T23:59:59Z'),
    }
    expect(effectiveGapDays('2026-04-01', '2026-04-05', vacation)).toBe(2)
  })

  it('subtracts all vacation days, reducing effective gap to 1', () => {
    // 3-day gap, 2 vacation days covering the middle
    const vacation = {
      vacationStart: new Date('2026-04-02T00:00:00Z'),
      vacationEnd: new Date('2026-04-03T23:59:59Z'),
    }
    expect(effectiveGapDays('2026-04-01', '2026-04-04', vacation)).toBe(1)
  })

  it('ignores vacation outside the gap', () => {
    const vacation = {
      vacationStart: new Date('2026-03-01T00:00:00Z'),
      vacationEnd: new Date('2026-03-05T23:59:59Z'),
    }
    expect(effectiveGapDays('2026-04-01', '2026-04-05', vacation)).toBe(4)
  })

  it('handles ongoing vacation (no end date)', () => {
    const vacation = {
      vacationStart: new Date('2026-04-02T00:00:00Z'),
      vacationEnd: null,
    }
    // Gap is 4 days, vacation covers days 2, 3, 4 (3 days in gap)
    expect(effectiveGapDays('2026-04-01', '2026-04-05', vacation)).toBe(1)
  })
})

describe('getEffectiveStreak', () => {
  it('returns 0 when lastActiveAt is null', () => {
    expect(getEffectiveStreak({ currentStreak: 0, lastActiveAt: null })).toBe(0)
  })

  it('returns 0 when currentStreak is 0', () => {
    expect(getEffectiveStreak({ currentStreak: 0, lastActiveAt: new Date() })).toBe(0)
  })

  it('returns stored streak when last active today', () => {
    expect(getEffectiveStreak({ currentStreak: 5, lastActiveAt: new Date() })).toBe(5)
  })

  it('returns stored streak when last active yesterday', () => {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    expect(getEffectiveStreak({ currentStreak: 3, lastActiveAt: yesterday })).toBe(3)
  })

  it('returns 0 when last active 2 days ago (streak broken)', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2)
    expect(getEffectiveStreak({ currentStreak: 10, lastActiveAt: twoDaysAgo })).toBe(0)
  })

  it('returns 0 when last active a week ago', () => {
    const weekAgo = new Date()
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)
    expect(getEffectiveStreak({ currentStreak: 5, lastActiveAt: weekAgo })).toBe(0)
  })

  it('preserves streak when gap is covered by vacation', () => {
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setUTCDate(fiveDaysAgo.getUTCDate() - 5)
    // Use start-of-day for vacation boundaries to ensure proper coverage
    const fourDaysAgo = new Date()
    fourDaysAgo.setUTCDate(fourDaysAgo.getUTCDate() - 4)
    fourDaysAgo.setUTCHours(0, 0, 0, 0)
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(23, 59, 59, 999)
    // Without vacation: streak broken (gap of 5)
    expect(getEffectiveStreak({ currentStreak: 10, lastActiveAt: fiveDaysAgo })).toBe(0)
    // With vacation covering days in between: streak preserved
    expect(getEffectiveStreak(
      { currentStreak: 10, lastActiveAt: fiveDaysAgo },
      { vacationStart: fourDaysAgo, vacationEnd: yesterday }
    )).toBe(10)
  })
})
