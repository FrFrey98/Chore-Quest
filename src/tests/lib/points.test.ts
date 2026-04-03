import { describe, it, expect } from 'vitest'
import { getCurrentPoints, getTotalEarned, getLevel } from '@/lib/points'
import { DEFAULT_LEVEL_DEFINITIONS } from '@/lib/config'

describe('getCurrentPoints', () => {
  it('returns earned minus spent', () => {
    expect(getCurrentPoints(500, 200)).toBe(300)
  })

  it('returns 0 when spent equals earned', () => {
    expect(getCurrentPoints(300, 300)).toBe(0)
  })

  it('never returns negative', () => {
    expect(getCurrentPoints(100, 200)).toBe(0)
  })
})

describe('getTotalEarned', () => {
  it('sums completion points', () => {
    const completions = [{ points: 50 }, { points: 80 }, { points: 30 }]
    expect(getTotalEarned(completions)).toBe(160)
  })

  it('returns 0 for empty array', () => {
    expect(getTotalEarned([])).toBe(0)
  })
})

describe('getLevel', () => {
  it('returns level 1 at 0 points', () => {
    expect(getLevel(0).level).toBe(1)
  })

  it('returns level 2 at 200 points', () => {
    expect(getLevel(200).level).toBe(2)
  })

  it('returns level 6 at 4000 points', () => {
    expect(getLevel(4000).level).toBe(6)
  })

  it('returns max level for very high points', () => {
    expect(getLevel(99999).level).toBe(DEFAULT_LEVEL_DEFINITIONS.length)
  })

  it('returns level 1 just below level 2 threshold (199 points)', () => {
    expect(getLevel(199).level).toBe(1)
  })

  it('returns correct title', () => {
    expect(getLevel(0).title).toBe('Haushaltslehrling')
    expect(getLevel(500).title).toBe('Putz-Profi')
  })

  it('respects custom level definitions', () => {
    const custom = [
      { level: 1, minPoints: 0, title: 'Beginner' },
      { level: 2, minPoints: 100, title: 'Pro' },
    ]
    expect(getLevel(50, custom).title).toBe('Beginner')
    expect(getLevel(100, custom).title).toBe('Pro')
  })
})
