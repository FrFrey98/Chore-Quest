import { describe, it, expect } from 'vitest'
import { checkAchievementCondition } from '@/lib/achievements'

describe('checkAchievementCondition', () => {
  const baseStats = {
    totalTaskCount: 55,
    categoryCounts: { 'cat-kitchen': 20, 'cat-bath': 10 } as Record<string, number>,
    currentStreakDays: 8,
    totalPointsEarned: 1200,
    currentLevel: 3,
  }

  it('returns true for task_count when threshold met', () => {
    expect(checkAchievementCondition('task_count', 50, null, baseStats)).toBe(true)
  })

  it('returns false for task_count when threshold not met', () => {
    expect(checkAchievementCondition('task_count', 100, null, baseStats)).toBe(false)
  })

  it('returns true for category_count when threshold met', () => {
    expect(checkAchievementCondition('category_count', 20, 'cat-kitchen', baseStats)).toBe(true)
  })

  it('returns false for category_count with unknown category', () => {
    expect(checkAchievementCondition('category_count', 1, 'cat-unknown', baseStats)).toBe(false)
  })

  it('returns true for streak_days when threshold met', () => {
    expect(checkAchievementCondition('streak_days', 7, null, baseStats)).toBe(true)
  })

  it('returns false for streak_days when threshold not met', () => {
    expect(checkAchievementCondition('streak_days', 14, null, baseStats)).toBe(false)
  })

  it('returns true for total_points when threshold met', () => {
    expect(checkAchievementCondition('total_points', 1000, null, baseStats)).toBe(true)
  })

  it('returns true for level when threshold met', () => {
    expect(checkAchievementCondition('level', 3, null, baseStats)).toBe(true)
  })

  it('returns false for level when threshold not met', () => {
    expect(checkAchievementCondition('level', 4, null, baseStats)).toBe(false)
  })

  it('returns false for unknown condition type', () => {
    expect(checkAchievementCondition('unknown_type', 1, null, baseStats)).toBe(false)
  })
})
