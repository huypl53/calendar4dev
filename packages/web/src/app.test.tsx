import { describe, it, expect } from 'vitest'
import { DEFAULT_EVENT_DURATION } from '@dev-calendar/shared'

describe('App', () => {
  it('imports shared constants', () => {
    expect(DEFAULT_EVENT_DURATION).toBe(30)
  })
})
