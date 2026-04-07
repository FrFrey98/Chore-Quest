import { describe, it, expect } from 'vitest'
import en from '../../../messages/en.json'
import de from '../../../messages/de.json'

describe('i18n message files', () => {
  it('EN and DE have the same top-level keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(de).sort())
  })

  it('EN and DE have the same nested keys', () => {
    function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
      return Object.entries(obj).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return getKeys(value as Record<string, unknown>, fullKey)
        }
        return [fullKey]
      })
    }

    const enKeys = getKeys(en).sort()
    const deKeys = getKeys(de).sort()
    expect(enKeys).toEqual(deKeys)
  })

  it('no empty translation values', () => {
    function checkValues(obj: Record<string, unknown>, path = ''): string[] {
      const empties: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key
        if (typeof value === 'string' && value.trim() === '') {
          empties.push(fullPath)
        } else if (typeof value === 'object' && value !== null) {
          empties.push(...checkValues(value as Record<string, unknown>, fullPath))
        }
      }
      return empties
    }

    expect(checkValues(en)).toEqual([])
    expect(checkValues(de)).toEqual([])
  })
})
