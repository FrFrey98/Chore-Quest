import { describe, it, expect } from 'vitest'
import { createTaskSchema, updateTaskSchema } from '@/lib/schemas/task'
import { createUserSchema } from '@/lib/schemas/user'
import { createCategorySchema, updateCategorySchema } from '@/lib/schemas/category'
import { createAchievementSchema } from '@/lib/schemas/achievement'
import { createStoreItemSchema, updateStoreItemSchema } from '@/lib/schemas/store-item'

describe('createTaskSchema', () => {
  it('accepts valid input with defaults', () => {
    const result = createTaskSchema.safeParse({
      title: 'Küche putzen',
      emoji: '🧹',
      points: 10,
      categoryId: 'cat1',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isRecurring).toBe(false)
      expect(result.data.allowMultiple).toBe(false)
      expect(result.data.assignedUserIds).toEqual([])
    }
  })

  it('rejects missing title', () => {
    const result = createTaskSchema.safeParse({ emoji: '🧹', points: 10, categoryId: 'cat1' })
    expect(result.success).toBe(false)
  })

  it('rejects negative points', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test', emoji: '🧹', points: -5, categoryId: 'cat1',
    })
    expect(result.success).toBe(false)
  })

  it('coerces string points to number', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test', emoji: '🧹', points: '10', categoryId: 'cat1',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.points).toBe(10)
  })

  it('validates scheduleDays format', () => {
    const valid = createTaskSchema.safeParse({
      title: 'Test', emoji: '🧹', points: 10, categoryId: 'cat1', scheduleDays: '1,3,5',
    })
    expect(valid.success).toBe(true)

    const invalid = createTaskSchema.safeParse({
      title: 'Test', emoji: '🧹', points: 10, categoryId: 'cat1', scheduleDays: '1,8',
    })
    expect(invalid.success).toBe(false)
  })
})

describe('updateTaskSchema', () => {
  it('accepts partial updates', () => {
    const result = updateTaskSchema.safeParse({ title: 'Neuer Titel' })
    expect(result.success).toBe(true)
  })

  it('accepts status field', () => {
    const result = updateTaskSchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = updateTaskSchema.safeParse({ status: 'deleted' })
    expect(result.success).toBe(false)
  })
})

describe('createUserSchema', () => {
  it('accepts valid user', () => {
    const result = createUserSchema.safeParse({ name: 'Franz', pin: '1234' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.role).toBe('member')
  })

  it('rejects short name', () => {
    const result = createUserSchema.safeParse({ name: 'A', pin: '1234' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid PIN format', () => {
    const result = createUserSchema.safeParse({ name: 'Franz', pin: '12' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({ name: 'Franz', pin: '1234', role: 'superadmin' })
    expect(result.success).toBe(false)
  })
})

describe('createCategorySchema', () => {
  it('accepts valid category', () => {
    const result = createCategorySchema.safeParse({ name: 'Küche', emoji: '🍳' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createCategorySchema.safeParse({ name: '', emoji: '🍳' })
    expect(result.success).toBe(false)
  })
})

describe('updateCategorySchema', () => {
  it('accepts partial update', () => {
    const result = updateCategorySchema.safeParse({ emoji: '🏠' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateCategorySchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('createAchievementSchema', () => {
  it('accepts valid achievement', () => {
    const result = createAchievementSchema.safeParse({
      title: 'Erste Aufgabe',
      description: 'Schließe deine erste Aufgabe ab',
      emoji: '🏆',
      conditionType: 'task_count',
      conditionValue: 1,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.conditionMeta).toBeNull()
      expect(result.data.sortOrder).toBe(0)
    }
  })

  it('rejects invalid conditionType', () => {
    const result = createAchievementSchema.safeParse({
      title: 'Test', description: 'Test', emoji: '🏆',
      conditionType: 'invalid', conditionValue: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative conditionValue', () => {
    const result = createAchievementSchema.safeParse({
      title: 'Test', description: 'Test', emoji: '🏆',
      conditionType: 'task_count', conditionValue: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('createStoreItemSchema', () => {
  it('accepts valid store item', () => {
    const result = createStoreItemSchema.safeParse({
      title: 'Filmabend', emoji: '🎬', pointCost: 50,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('')
      expect(result.data.isActive).toBe(true)
    }
  })

  it('coerces string pointCost', () => {
    const result = createStoreItemSchema.safeParse({
      title: 'Test', emoji: '🎬', pointCost: '50',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.pointCost).toBe(50)
  })

  it('rejects zero pointCost', () => {
    const result = createStoreItemSchema.safeParse({
      title: 'Test', emoji: '🎬', pointCost: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('updateStoreItemSchema', () => {
  it('accepts partial update', () => {
    const result = updateStoreItemSchema.safeParse({ pointCost: 100 })
    expect(result.success).toBe(true)
  })
})
