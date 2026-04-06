import { describe, it, expect } from 'vitest'
import { hasPermission, getVisibleNavItems } from '@/lib/permissions'

describe('hasPermission', () => {
  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'manageUsers')).toBe(true)
    expect(hasPermission('admin', 'editSettings')).toBe(true)
    expect(hasPermission('admin', 'createTasks')).toBe(true)
    expect(hasPermission('admin', 'completeTasks')).toBe(true)
  })

  it('member can create and approve tasks but not manage users', () => {
    expect(hasPermission('member', 'createTasks')).toBe(true)
    expect(hasPermission('member', 'approveTasks')).toBe(true)
    expect(hasPermission('member', 'manageUsers')).toBe(false)
    expect(hasPermission('member', 'editSettings')).toBe(false)
  })

  it('child can only complete tasks, use store, and view profiles', () => {
    expect(hasPermission('child', 'completeTasks')).toBe(true)
    expect(hasPermission('child', 'useStore')).toBe(true)
    expect(hasPermission('child', 'viewAllProfiles')).toBe(true)
    expect(hasPermission('child', 'createTasks')).toBe(false)
    expect(hasPermission('child', 'approveTasks')).toBe(false)
    expect(hasPermission('child', 'manageUsers')).toBe(false)
  })
})

describe('getVisibleNavItems', () => {
  it('child does not see approvals, manage, or settings', () => {
    const items = getVisibleNavItems('child')
    const hrefs = items.map((i) => i.href)
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/tasks')
    expect(hrefs).toContain('/store')
    expect(hrefs).not.toContain('/approvals')
    expect(hrefs).not.toContain('/manage')
    expect(hrefs).not.toContain('/settings')
  })

  it('member sees approvals and manage but not settings', () => {
    const items = getVisibleNavItems('member')
    const hrefs = items.map((i) => i.href)
    expect(hrefs).toContain('/approvals')
    expect(hrefs).toContain('/manage')
    expect(hrefs).not.toContain('/settings')
  })

  it('admin sees everything', () => {
    const items = getVisibleNavItems('admin')
    const hrefs = items.map((i) => i.href)
    expect(hrefs).toContain('/settings')
    expect(hrefs).toContain('/approvals')
    expect(hrefs).toContain('/manage')
  })
})
