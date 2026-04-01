import { describe, it, expect } from 'vitest'
import { createCalendarSchema, updateCalendarSchema } from './calendar.js'

describe('createCalendarSchema', () => {
  it('accepts valid calendar data', () => {
    const result = createCalendarSchema.safeParse({
      name: 'Work',
      color: '#dc2626',
      timezone: 'America/New_York',
    })
    expect(result.success).toBe(true)
  })

  it('requires name', () => {
    const result = createCalendarSchema.safeParse({ color: '#dc2626' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid hex color', () => {
    const result = createCalendarSchema.safeParse({
      name: 'Work',
      color: 'red',
    })
    expect(result.success).toBe(false)
  })

  it('accepts name only', () => {
    const result = createCalendarSchema.safeParse({ name: 'Personal' })
    expect(result.success).toBe(true)
  })
})

describe('updateCalendarSchema', () => {
  it('accepts partial updates', () => {
    const result = updateCalendarSchema.safeParse({ color: '#2563eb' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateCalendarSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
