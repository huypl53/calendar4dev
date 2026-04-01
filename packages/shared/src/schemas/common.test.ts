import { describe, it, expect } from 'vitest'
import { apiErrorSchema } from './common.js'

describe('apiErrorSchema', () => {
  it('parses a valid API error', () => {
    const result = apiErrorSchema.parse({
      code: 'NOT_FOUND',
      message: 'Resource not found',
    })
    expect(result.code).toBe('NOT_FOUND')
    expect(result.message).toBe('Resource not found')
  })

  it('rejects an invalid API error', () => {
    expect(() => apiErrorSchema.parse({ code: 123 })).toThrow()
  })
})
