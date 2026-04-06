import { describe, it, expect } from 'vitest'
import { getTasksForMonth, type CalendarTask, type CalendarDay } from '@/lib/calendar'

describe('getTasksForMonth', () => {
  const baseTask: CalendarTask = {
    id: 'task1',
    emoji: '🧹',
    title: 'Putzen',
    points: 20,
    isRecurring: true,
    recurringInterval: 'daily',
    scheduleDays: null,
    nextDueAt: null,
  }

  it('marks a daily task as due every day of the month', () => {
    const days = getTasksForMonth(2026, 4, [baseTask], [], [])
    expect(days).toHaveLength(30) // April has 30 days
    expect(days[0].tasks).toHaveLength(1)
    expect(days[0].tasks[0].status).toBe('pending')
    expect(days[0].date).toBe('2026-04-01')
  })

  it('marks tasks as completed when a completion exists', () => {
    const completions = [{ taskId: 'task1', date: '2026-04-05', points: 22 }]
    const days = getTasksForMonth(2026, 4, [baseTask], completions, [])
    const apr5 = days.find((d) => d.date === '2026-04-05')!
    expect(apr5.tasks[0].status).toBe('completed')
    expect(apr5.tasks[0].points).toBe(22)
  })

  it('only shows weekday-pattern task on specified days', () => {
    const weekdayTask: CalendarTask = {
      ...baseTask,
      id: 'task2',
      scheduleDays: 'mon,wed,fri',
      recurringInterval: null,
    }
    const days = getTasksForMonth(2026, 4, [weekdayTask], [], [])
    // April 2026: Mon=6,13,20,27  Wed=1,8,15,22,29  Fri=3,10,17,24 = 13 days
    const daysWithTask = days.filter((d) => d.tasks.length > 0)
    expect(daysWithTask).toHaveLength(13)
  })

  it('respects skip overrides', () => {
    const weekdayTask: CalendarTask = {
      ...baseTask,
      id: 'task2',
      scheduleDays: 'mon',
    }
    const overrides = [{ taskId: 'task2', date: '2026-04-06', type: 'skip' as const }]
    const days = getTasksForMonth(2026, 4, [weekdayTask], [], overrides)
    const apr6 = days.find((d) => d.date === '2026-04-06')!
    expect(apr6.tasks).toHaveLength(0)
  })

  it('includes add overrides on extra days', () => {
    const weekdayTask: CalendarTask = {
      ...baseTask,
      id: 'task2',
      scheduleDays: 'mon',
    }
    const overrides = [{ taskId: 'task2', date: '2026-04-07', type: 'add' as const }]
    const days = getTasksForMonth(2026, 4, [weekdayTask], [], overrides)
    const apr7 = days.find((d) => d.date === '2026-04-07')!
    expect(apr7.tasks).toHaveLength(1)
  })

  it('marks past uncompleted tasks as missed', () => {
    const days = getTasksForMonth(2026, 3, [baseTask], [], [])
    // March 2026 is in the past (today is April 6, 2026)
    expect(days[0].tasks[0].status).toBe('missed')
  })
})
