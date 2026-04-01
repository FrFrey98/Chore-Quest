import { describe, it, expect } from 'vitest'
import { groupByDay, groupByWeek, groupByCategory, topTasks, buildHeatmap, buildScoreboard } from '@/lib/stats'

describe('groupByDay', () => {
  it('groups completions by date and sums counts and points', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u1', taskId: 't2' },
      { completedAt: new Date('2026-03-16T09:00:00Z'), points: 40, userId: 'u1', taskId: 't1' },
    ]
    const result = groupByDay(completions)
    expect(result).toEqual([
      { date: '2026-03-15', count: 2, points: 50 },
      { date: '2026-03-16', count: 1, points: 40 },
    ])
  })

  it('filters by userId when provided', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u2', taskId: 't2' },
    ]
    const result = groupByDay(completions, 'u1')
    expect(result).toEqual([{ date: '2026-03-15', count: 1, points: 30 }])
  })

  it('returns empty array for no completions', () => {
    expect(groupByDay([])).toEqual([])
  })
})

describe('groupByWeek', () => {
  it('groups completions by ISO week', () => {
    const completions = [
      { completedAt: new Date('2026-03-30T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-31T10:00:00Z'), points: 20, userId: 'u1', taskId: 't2' },
      { completedAt: new Date('2026-04-06T10:00:00Z'), points: 40, userId: 'u1', taskId: 't1' },
    ]
    const result = groupByWeek(completions)
    expect(result).toHaveLength(2)
    expect(result[0].week).toBe('KW 14')
    expect(result[0].count).toBe(2)
    expect(result[0].points).toBe(50)
    expect(result[1].week).toBe('KW 15')
    expect(result[1].count).toBe(1)
  })

  it('filters by userId when provided', () => {
    const completions = [
      { completedAt: new Date('2026-03-30T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-30T14:00:00Z'), points: 20, userId: 'u2', taskId: 't2' },
    ]
    const result = groupByWeek(completions, 'u1')
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(1)
    expect(result[0].points).toBe(30)
  })

  it('returns weeks in ascending order even when input is in reverse chronological order', () => {
    const completions = [
      { completedAt: new Date('2026-04-06T10:00:00Z'), points: 40, userId: 'u1', taskId: 't1' },
      { completedAt: new Date('2026-03-31T10:00:00Z'), points: 20, userId: 'u1', taskId: 't2' },
      { completedAt: new Date('2026-03-30T10:00:00Z'), points: 30, userId: 'u1', taskId: 't3' },
    ]
    const result = groupByWeek(completions)
    expect(result).toHaveLength(2)
    expect(result[0].week).toBe('KW 14')
    expect(result[1].week).toBe('KW 15')
  })

  it('orders KW 52 of 2025 before KW 1 of 2026 across a year boundary', () => {
    const completions = [
      // KW 1 of 2026 (ISO): week starting Mon 29 Dec 2025
      { completedAt: new Date('2026-01-02T10:00:00Z'), points: 10, userId: 'u1', taskId: 't1' },
      // KW 52 of 2025: week starting Mon 22 Dec 2025
      { completedAt: new Date('2025-12-22T10:00:00Z'), points: 20, userId: 'u1', taskId: 't2' },
    ]
    const result = groupByWeek(completions)
    expect(result).toHaveLength(2)
    expect(result[0].week).toBe('KW 52')
    expect(result[0].points).toBe(20)
    expect(result[1].week).toBe('KW 1')
    expect(result[1].points).toBe(10)
  })
})

describe('groupByCategory', () => {
  it('groups completions by category with name and emoji', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1', task: { categoryId: 'c1' } },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u1', taskId: 't2', task: { categoryId: 'c1' } },
      { completedAt: new Date('2026-03-16T09:00:00Z'), points: 40, userId: 'u1', taskId: 't3', task: { categoryId: 'c2' } },
    ]
    const categories = [
      { id: 'c1', name: 'Küche', emoji: '🍳' },
      { id: 'c2', name: 'Bad', emoji: '🚿' },
    ]
    const result = groupByCategory(completions, categories)
    expect(result).toEqual([
      { categoryId: 'c1', name: 'Küche', emoji: '🍳', count: 2 },
      { categoryId: 'c2', name: 'Bad', emoji: '🚿', count: 1 },
    ])
  })

  it('filters by userId when provided', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30, userId: 'u1', taskId: 't1', task: { categoryId: 'c1' } },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20, userId: 'u2', taskId: 't2', task: { categoryId: 'c1' } },
    ]
    const categories = [{ id: 'c1', name: 'Küche', emoji: '🍳' }]
    const result = groupByCategory(completions, categories, 'u1')
    expect(result).toEqual([{ categoryId: 'c1', name: 'Küche', emoji: '🍳', count: 1 }])
  })
})

describe('topTasks', () => {
  it('returns top tasks sorted by count descending', () => {
    const completions = [
      { taskId: 't1', task: { title: 'Staubsaugen', emoji: '🧹' } },
      { taskId: 't1', task: { title: 'Staubsaugen', emoji: '🧹' } },
      { taskId: 't1', task: { title: 'Staubsaugen', emoji: '🧹' } },
      { taskId: 't2', task: { title: 'Abspülen', emoji: '🍽️' } },
      { taskId: 't2', task: { title: 'Abspülen', emoji: '🍽️' } },
    ] as any[]
    const result = topTasks(completions, 5)
    expect(result).toEqual([
      { taskId: 't1', title: 'Staubsaugen', emoji: '🧹', count: 3 },
      { taskId: 't2', title: 'Abspülen', emoji: '🍽️', count: 2 },
    ])
  })

  it('limits results to specified count', () => {
    const completions = [
      { taskId: 't1', task: { title: 'A', emoji: '1' } },
      { taskId: 't2', task: { title: 'B', emoji: '2' } },
      { taskId: 't3', task: { title: 'C', emoji: '3' } },
    ] as any[]
    const result = topTasks(completions, 2)
    expect(result).toHaveLength(2)
  })
})

describe('buildHeatmap', () => {
  it('sums points per day as YYYY-MM-DD keys', () => {
    const completions = [
      { completedAt: new Date('2026-03-15T10:00:00Z'), points: 30 },
      { completedAt: new Date('2026-03-15T14:00:00Z'), points: 20 },
      { completedAt: new Date('2026-03-16T09:00:00Z'), points: 40 },
    ] as any[]
    const result = buildHeatmap(completions)
    expect(result).toEqual({ '2026-03-15': 50, '2026-03-16': 40 })
  })

  it('returns empty object for no completions', () => {
    expect(buildHeatmap([])).toEqual({})
  })
})

describe('buildScoreboard', () => {
  it('sums task count and points per user', () => {
    const completions = [
      { userId: 'u1', points: 30 },
      { userId: 'u1', points: 20 },
      { userId: 'u2', points: 40 },
    ] as any[]
    const users = [
      { id: 'u1', name: 'Franz' },
      { id: 'u2', name: 'Michelle' },
    ]
    const result = buildScoreboard(completions, users)
    expect(result).toEqual([
      { userId: 'u1', name: 'Franz', taskCount: 2, points: 50 },
      { userId: 'u2', name: 'Michelle', taskCount: 1, points: 40 },
    ])
  })
})
