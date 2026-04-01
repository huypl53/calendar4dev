import { describe, it, expect } from 'vitest'
import { envSchema } from './env-schema.js'

describe('env validation', () => {
  it('parses valid environment variables', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/devcalendar',
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
      DATABASE_URL: 'postgresql://localhost:5432/db',
      NODE_ENV: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('applies defaults for optional fields', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://localhost:5432/db',
    })
    expect(result.NODE_ENV).toBe('development')
    expect(result.LOG_LEVEL).toBe('info')
    expect(result.PORT).toBe(3000)
  })
})
