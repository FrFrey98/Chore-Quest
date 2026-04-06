import { describe, it, expect } from 'vitest'
import { isTaskDueForNotification, buildNotificationPayload } from '@/lib/push'

describe('isTaskDueForNotification', () => {
  const base = {
    scheduleTime: '09:00',
    scheduleDays: null as string | null,
    nextDueAt: new Date('2026-04-06T00:00:00Z'),
    lastNotifiedAt: null as Date | null,
  }

  it('returns true when scheduleTime matches and task is due', () => {
    const now = new Date('2026-04-06T09:00:30Z')
    expect(isTaskDueForNotification(base, now)).toBe(true)
  })

  it('returns false when scheduleTime does not match', () => {
    const now = new Date('2026-04-06T10:00:00Z')
    expect(isTaskDueForNotification(base, now)).toBe(false)
  })

  it('returns false when scheduleTime is null', () => {
    const now = new Date('2026-04-06T09:00:00Z')
    expect(isTaskDueForNotification({ ...base, scheduleTime: null }, now)).toBe(false)
  })

  it('returns false when already notified today', () => {
    const now = new Date('2026-04-06T09:00:00Z')
    expect(isTaskDueForNotification({
      ...base,
      lastNotifiedAt: new Date('2026-04-06T08:00:00Z'),
    }, now)).toBe(false)
  })

  it('returns true when notified on a different day', () => {
    const now = new Date('2026-04-06T09:00:00Z')
    expect(isTaskDueForNotification({
      ...base,
      lastNotifiedAt: new Date('2026-04-05T09:00:00Z'),
    }, now)).toBe(true)
  })

  it('returns true when scheduleDays contains today', () => {
    // 2026-04-06 is a Monday
    const now = new Date('2026-04-06T09:00:00Z')
    expect(isTaskDueForNotification({
      ...base,
      nextDueAt: null,
      scheduleDays: 'mon,wed,fri',
    }, now)).toBe(true)
  })

  it('returns false when scheduleDays does not contain today', () => {
    // 2026-04-06 is a Monday
    const now = new Date('2026-04-06T09:00:00Z')
    expect(isTaskDueForNotification({
      ...base,
      nextDueAt: null,
      scheduleDays: 'tue,thu',
    }, now)).toBe(false)
  })

  it('returns false when nextDueAt is in the future', () => {
    const now = new Date('2026-04-06T09:00:00Z')
    expect(isTaskDueForNotification({
      ...base,
      nextDueAt: new Date('2026-04-07T00:00:00Z'),
    }, now)).toBe(false)
  })
})

describe('buildNotificationPayload', () => {
  it('creates payload with emoji and title', () => {
    const payload = buildNotificationPayload({ emoji: '🧹', title: 'Küche aufräumen' })
    expect(payload).toEqual({
      title: 'Chore-Quest',
      body: '🧹 Küche aufräumen',
      data: { url: '/tasks' },
    })
  })
})
