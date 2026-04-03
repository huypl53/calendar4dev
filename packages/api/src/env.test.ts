import { describe, it, expect } from 'vitest'
import { envSchema } from './env-schema.js'

const validEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/devcalendar',
  BETTER_AUTH_SECRET: 'a-very-long-secret-that-is-at-least-32-chars',
  BETTER_AUTH_URL: 'http://localhost:3001',
}

describe('env validation', () => {
  it('parses valid environment variables', () => {
    const result = envSchema.parse({
      ...validEnv,
      NODE_ENV: 'test',
    })
    expect(result.DATABASE_URL).toBe('postgresql://postgres:postgres@localhost:5432/devcalendar')
    expect(result.NODE_ENV).toBe('test')
    expect(result.PORT).toBe(3000)
    expect(result.API_PORT).toBe(3001)
  })

  it('rejects missing DATABASE_URL', () => {
    const result = envSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid NODE_ENV', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      NODE_ENV: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('applies defaults for optional fields', () => {
    const result = envSchema.parse(validEnv)
    expect(result.NODE_ENV).toBe('development')
    expect(result.LOG_LEVEL).toBe('info')
    expect(result.PORT).toBe(3000)
  })

  it('rejects missing BETTER_AUTH_SECRET', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
      BETTER_AUTH_URL: 'http://localhost:3001',
    })
    expect(result.success).toBe(false)
  })

  it('rejects BETTER_AUTH_SECRET shorter than 32 chars', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      BETTER_AUTH_SECRET: 'too-short',
    })
    expect(result.success).toBe(false)
  })

  it('treats GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET as optional', () => {
    const result = envSchema.parse(validEnv)
    expect(result.GITHUB_CLIENT_ID).toBeUndefined()
    expect(result.GITHUB_CLIENT_SECRET).toBeUndefined()
  })

  it('accepts both GitHub vars set together', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      GITHUB_CLIENT_ID: 'some-id',
      GITHUB_CLIENT_SECRET: 'some-secret',
    })
    expect(result.success).toBe(true)
  })

  it('rejects GITHUB_CLIENT_ID without GITHUB_CLIENT_SECRET', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      GITHUB_CLIENT_ID: 'some-id',
    })
    expect(result.success).toBe(false)
  })

  it('rejects GITHUB_CLIENT_SECRET without GITHUB_CLIENT_ID', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      GITHUB_CLIENT_SECRET: 'some-secret',
    })
    expect(result.success).toBe(false)
  })
})
