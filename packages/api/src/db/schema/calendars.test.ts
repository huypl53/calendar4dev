import { describe, it, expect } from 'vitest'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { calendars, calendarMembers, permissionLevelEnum } from './calendars.js'

describe('calendars table schema', () => {
  const config = getTableConfig(calendars)

  it('has the correct table name', () => {
    expect(config.name).toBe('calendars')
  })

  it('defines all required columns', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).toEqual(
      expect.arrayContaining(['id', 'userId', 'name', 'description', 'color', 'timezone', 'isPrimary', 'createdAt', 'updatedAt'])
    )
  })

  it('has id as primary key with default', () => {
    const idCol = config.columns.find(c => c.name === 'id')!
    expect(idCol.primary).toBe(true)
    expect(idCol.hasDefault).toBe(true)
  })

  it('has name as not null', () => {
    const nameCol = config.columns.find(c => c.name === 'name')!
    expect(nameCol.notNull).toBe(true)
  })

  it('has color default #1f2937', () => {
    const colorCol = config.columns.find(c => c.name === 'color')!
    expect(colorCol.hasDefault).toBe(true)
  })

  it('has timezone default UTC', () => {
    const tzCol = config.columns.find(c => c.name === 'timezone')!
    expect(tzCol.hasDefault).toBe(true)
  })

  it('has isPrimary default false', () => {
    const col = config.columns.find(c => c.name === 'isPrimary')!
    expect(col.hasDefault).toBe(true)
  })

  it('has unique index on userId + name', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_calendars_user_name')
    expect(idx).toBeDefined()
    expect(idx!.config.unique).toBe(true)
  })

  it('has index on userId', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_calendars_user_id')
    expect(idx).toBeDefined()
  })

  it('has foreign key to users', () => {
    expect(config.foreignKeys.length).toBeGreaterThanOrEqual(1)
  })
})

describe('calendar_members table schema', () => {
  const config = getTableConfig(calendarMembers)

  it('has the correct table name', () => {
    expect(config.name).toBe('calendar_members')
  })

  it('defines all required columns', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).toEqual(
      expect.arrayContaining(['id', 'calendarId', 'userId', 'permissionLevel', 'createdAt'])
    )
  })

  it('has unique index on calendarId + userId', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_calendar_members_unique')
    expect(idx).toBeDefined()
    expect(idx!.config.unique).toBe(true)
  })

  it('has index on userId', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_calendar_members_user_id')
    expect(idx).toBeDefined()
  })

  it('has foreign keys to calendars and users', () => {
    expect(config.foreignKeys.length).toBe(2)
  })
})

describe('permissionLevelEnum', () => {
  it('has the correct values', () => {
    expect(permissionLevelEnum.enumValues).toEqual(['free_busy', 'details', 'edit', 'admin'])
  })
})
