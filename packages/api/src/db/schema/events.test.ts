import { describe, it, expect } from 'vitest'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { events, eventExceptions, eventTypeEnum, eventStatusEnum, eventVisibilityEnum, exceptionTypeEnum } from './events.js'

describe('events table schema', () => {
  const config = getTableConfig(events)

  it('has the correct table name', () => {
    expect(config.name).toBe('events')
  })

  it('defines all required columns', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id', 'calendarId', 'title', 'description', 'startTime', 'endTime',
        'allDay', 'location', 'color', 'status', 'visibility', 'eventType',
        'recurrenceRule', 'search_vector', 'createdAt', 'updatedAt',
      ])
    )
  })

  it('has id as primary key with cuid2 default', () => {
    const idCol = config.columns.find(c => c.name === 'id')!
    expect(idCol.primary).toBe(true)
    expect(idCol.hasDefault).toBe(true)
  })

  it('has title as not null', () => {
    const col = config.columns.find(c => c.name === 'title')!
    expect(col.notNull).toBe(true)
  })

  it('has startTime and endTime as not null timestamptz', () => {
    const start = config.columns.find(c => c.name === 'startTime')!
    const end = config.columns.find(c => c.name === 'endTime')!
    expect(start.notNull).toBe(true)
    expect(end.notNull).toBe(true)
  })

  it('has allDay default false', () => {
    const col = config.columns.find(c => c.name === 'allDay')!
    expect(col.hasDefault).toBe(true)
  })

  it('has description, location, color, recurrenceRule as nullable', () => {
    for (const name of ['description', 'location', 'color', 'recurrenceRule']) {
      const col = config.columns.find(c => c.name === name)!
      expect(col.notNull).toBe(false)
    }
  })

  it('has searchVector column', () => {
    const col = config.columns.find(c => c.name === 'search_vector')
    expect(col).toBeDefined()
  })

  it('has index on calendarId', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_events_calendar_id')
    expect(idx).toBeDefined()
  })

  it('has index on startTime', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_events_start_time')
    expect(idx).toBeDefined()
  })

  it('has GIN index on searchVector', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_events_search')
    expect(idx).toBeDefined()
  })

  it('has composite index on calendarId + startTime', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_events_calendar_start')
    expect(idx).toBeDefined()
  })

  it('has foreign key to calendars', () => {
    expect(config.foreignKeys.length).toBeGreaterThanOrEqual(1)
  })
})

describe('event_exceptions table schema', () => {
  const config = getTableConfig(eventExceptions)

  it('has the correct table name', () => {
    expect(config.name).toBe('event_exceptions')
  })

  it('defines all required columns', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).toEqual(
      expect.arrayContaining(['id', 'eventId', 'exceptionDate', 'exceptionType', 'modifiedEventData', 'createdAt'])
    )
  })

  it('has id as primary key with default', () => {
    const idCol = config.columns.find(c => c.name === 'id')!
    expect(idCol.primary).toBe(true)
    expect(idCol.hasDefault).toBe(true)
  })

  it('has unique index on eventId + exceptionDate', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_event_exceptions_unique')
    expect(idx).toBeDefined()
    expect(idx!.config.unique).toBe(true)
  })

  it('has foreign key to events', () => {
    expect(config.foreignKeys.length).toBeGreaterThanOrEqual(1)
  })
})

describe('event enums', () => {
  it('eventTypeEnum has 7 values', () => {
    expect(eventTypeEnum.enumValues).toEqual([
      'standard', 'all_day', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location',
    ])
  })

  it('eventStatusEnum has busy and free', () => {
    expect(eventStatusEnum.enumValues).toEqual(['busy', 'free'])
  })

  it('eventVisibilityEnum has public and private', () => {
    expect(eventVisibilityEnum.enumValues).toEqual(['public', 'private'])
  })

  it('exceptionTypeEnum has cancelled and modified', () => {
    expect(exceptionTypeEnum.enumValues).toEqual(['cancelled', 'modified'])
  })
})
