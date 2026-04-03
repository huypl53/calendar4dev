import { describe, it, expect } from 'vitest'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { sessions } from './sessions.js'

describe('sessions table schema', () => {
  const config = getTableConfig(sessions)

  it('has the correct table name', () => {
    expect(config.name).toBe('sessions')
  })

  it('defines all required columns', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).toContain('id')
    expect(columnNames).toContain('userId')
    expect(columnNames).toContain('token')
    expect(columnNames).toContain('expiresAt')
    expect(columnNames).toContain('ipAddress')
    expect(columnNames).toContain('userAgent')
    expect(columnNames).toContain('createdAt')
    expect(columnNames).toContain('updatedAt')
  })

  it('has id as primary key with default', () => {
    const idCol = config.columns.find(c => c.name === 'id')!
    expect(idCol.primary).toBe(true)
    expect(idCol.hasDefault).toBe(true)
  })

  it('has token as unique and not null', () => {
    const tokenCol = config.columns.find(c => c.name === 'token')!
    expect(tokenCol.notNull).toBe(true)
    expect(tokenCol.isUnique).toBe(true)
  })

  it('has user_id as not null with foreign key', () => {
    const userIdCol = config.columns.find(c => c.name === 'userId')!
    expect(userIdCol.notNull).toBe(true)
    expect(config.foreignKeys.length).toBeGreaterThanOrEqual(1)
  })

  it('has ipAddress and userAgent as nullable', () => {
    const ipCol = config.columns.find(c => c.name === 'ipAddress')!
    const uaCol = config.columns.find(c => c.name === 'userAgent')!
    expect(ipCol.notNull).toBe(false)
    expect(uaCol.notNull).toBe(false)
  })

  it('has index on userId', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_sessions_user_id')
    expect(idx).toBeDefined()
  })

  it('has index on expiresAt', () => {
    const idx = config.indexes.find(i => i.config.name === 'idx_sessions_expires_at')
    expect(idx).toBeDefined()
  })
})
