import { describe, it, expect } from 'vitest'
import { groupFeedByDay, getWeekBounds } from '@/lib/dashboard'

describe('getWeekBounds', () => {
  it('returns Monday 00:00 to Sunday 23:59 for a Wednesday', () => {
    // Wednesday 2026-04-01
    const date = new Date('2026-04-01T14:00:00Z')
    const { start, end } = getWeekBounds(date)
    expect(start.toISOString()).toBe('2026-03-30T00:00:00.000Z') // Monday
    expect(end.getUTCDay()).toBe(0) // Sunday
    expect(end.getUTCHours()).toBe(23)
  })

  it('returns correct bounds when date is Monday', () => {
    const date = new Date('2026-03-30T08:00:00Z') // Monday
    const { start } = getWeekBounds(date)
    expect(start.toISOString()).toBe('2026-03-30T00:00:00.000Z')
  })

  it('returns correct bounds when date is Sunday', () => {
    const date = new Date('2026-04-05T20:00:00Z') // Sunday
    const { start, end } = getWeekBounds(date)
    expect(start.toISOString()).toBe('2026-03-30T00:00:00.000Z')
    expect(end.toISOString().slice(0, 10)).toBe('2026-04-05')
  })
})

describe('groupFeedByDay', () => {
  const now = new Date('2026-04-01T18:00:00Z')

  it('groups entries into today, yesterday, this week, last week', () => {
    const entries = [
      { id: '1', at: '2026-04-01T10:00:00Z' }, // today
      { id: '2', at: '2026-03-31T10:00:00Z' }, // yesterday
      { id: '3', at: '2026-03-30T10:00:00Z' }, // this week (Monday)
      { id: '4', at: '2026-03-25T10:00:00Z' }, // last week
    ] as any[]
    const groups = groupFeedByDay(entries, now)
    expect(groups).toHaveLength(4)
    expect(groups[0].label).toBe('Heute')
    expect(groups[0].entries).toHaveLength(1)
    expect(groups[1].label).toBe('Gestern')
    expect(groups[1].entries).toHaveLength(1)
    expect(groups[2].label).toBe('Diese Woche')
    expect(groups[2].entries).toHaveLength(1)
    expect(groups[3].label).toBe('Letzte Woche')
    expect(groups[3].entries).toHaveLength(1)
  })

  it('omits empty groups', () => {
    const entries = [
      { id: '1', at: '2026-04-01T10:00:00Z' },
    ] as any[]
    const groups = groupFeedByDay(entries, now)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Heute')
  })

  it('returns empty array for no entries', () => {
    expect(groupFeedByDay([], now)).toEqual([])
  })

  it('computes totalTasks and totalPoints from completion entries', () => {
    const entries = [
      { id: '1', type: 'completion', user: { id: 'u1', name: 'Franz' }, task: { title: 'T1', emoji: '🧹' }, points: 30, at: '2026-04-01T10:00:00Z' },
      { id: '2', type: 'completion', user: { id: 'u1', name: 'Franz' }, task: { title: 'T2', emoji: '🍳' }, points: 40, at: '2026-04-01T12:00:00Z' },
      { id: '3', type: 'redemption', user: { id: 'u1', name: 'Franz' }, item: { title: 'R1', emoji: '🎁' }, points: 0, at: '2026-04-01T14:00:00Z' },
    ] as any[]
    const groups = groupFeedByDay(entries, now)
    expect(groups[0].totalTasks).toBe(2)
    expect(groups[0].totalPoints).toBe(70)
  })
})
