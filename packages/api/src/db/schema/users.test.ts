import { describe, it, expect } from 'vitest'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { users } from './users.js'

describe('users table schema', () => {
  const config = getTableConfig(users)

  it('has the correct table name', () => {
    expect(config.name).toBe('users')
  })

  it('defines all required columns', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).toContain('id')
    expect(columnNames).toContain('email')
    expect(columnNames).toContain('name')
    expect(columnNames).toContain('createdAt')
    expect(columnNames).toContain('updatedAt')
  })

  it('does not have Better Auth columns (emailVerified, image, passwordHash)', () => {
    const columnNames = config.columns.map(c => c.name)
    expect(columnNames).not.toContain('emailVerified')
    expect(columnNames).not.toContain('image')
    expect(columnNames).not.toContain('passwordHash')
  })

  it('has id as primary key', () => {
    const idCol = config.columns.find(c => c.name === 'id')!
    expect(idCol.primary).toBe(true)
  })

  it('has email as unique and not null', () => {
    const emailCol = config.columns.find(c => c.name === 'email')!
    expect(emailCol.notNull).toBe(true)
    expect(emailCol.isUnique).toBe(true)
  })

  it('has name as nullable', () => {
    const nameCol = config.columns.find(c => c.name === 'name')!
    expect(nameCol.notNull).toBe(false)
  })
})
