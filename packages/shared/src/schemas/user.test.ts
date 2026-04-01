import { describe, it, expect } from 'vitest'
import { createUserSchema, updateUserSchema } from './user.js'

describe('createUserSchema', () => {
  it('accepts valid user data', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      name: 'Test User',
      password: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('accepts email-only (OAuth flow)', () => {
    const result = createUserSchema.safeParse({ email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('accepts null name', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      name: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('updateUserSchema', () => {
  it('accepts partial updates', () => {
    const result = updateUserSchema.safeParse({ name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateUserSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
