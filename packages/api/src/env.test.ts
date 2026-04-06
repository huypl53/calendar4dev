import { describe, it, expect } from 'vitest'
import { envSchema } from './env-schema.js'

const validEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/devcalendar',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  SUPABASE_ANON_KEY: 'test-anon-key',
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

  it('rejects missing SUPABASE_URL', () => {
    const { SUPABASE_URL: _, ...rest } = validEnv
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects missing SUPABASE_SERVICE_ROLE_KEY', () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _, ...rest } = validEnv
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
