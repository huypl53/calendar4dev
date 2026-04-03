import { describe, it, expect } from 'vitest'
import { createEventSchema, updateEventSchema } from './event.js'

describe('createEventSchema', () => {
  const validEvent = {
    calendarId: 'clr1abc123',
    title: 'Team Meeting',
    startTime: '2026-04-01T09:00:00Z',
    endTime: '2026-04-01T10:00:00Z',
  }

  it('accepts valid event data', () => {
    const result = createEventSchema.safeParse(validEvent)
    expect(result.success).toBe(true)
  })

  it('accepts event with all optional fields', () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      description: 'Weekly sync',
      allDay: false,
      location: 'Room 101',
      color: '#dc2626',
      status: 'busy',
      visibility: 'public',
      eventType: 'standard',
      recurrenceRule: 'RRULE:FREQ=WEEKLY',
    })
    expect(result.success).toBe(true)
  })

  it('requires calendarId, title, startTime, endTime', () => {
    expect(createEventSchema.safeParse({}).success).toBe(false)
    expect(createEventSchema.safeParse({ calendarId: 'x' }).success).toBe(false)
    expect(createEventSchema.safeParse({ calendarId: 'x', title: 'T' }).success).toBe(false)
    expect(createEventSchema.safeParse({ calendarId: 'x', title: 'T', startTime: '2026-04-01T09:00:00Z' }).success).toBe(false)
  })

  it('rejects invalid datetime format', () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      startTime: '2026-04-01',
    })
    expect(result.success).toBe(false)
  })

  it('validates eventType enum values', () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      eventType: 'invalid_type',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all 7 event types', () => {
    const types = ['standard', 'all_day', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location']
    for (const eventType of types) {
      const result = createEventSchema.safeParse({ ...validEvent, eventType })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid hex color', () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      color: 'blue',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateEventSchema', () => {
  it('accepts partial updates', () => {
    const result = updateEventSchema.safeParse({ title: 'Updated Meeting' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateEventSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('validates datetime on optional fields', () => {
    const result = updateEventSchema.safeParse({ startTime: 'not-a-date' })
    expect(result.success).toBe(false)
  })
})
