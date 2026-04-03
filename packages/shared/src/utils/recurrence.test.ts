import { describe, it, expect } from 'vitest'
import { expandRecurrence, RECURRENCE_OPTIONS } from './recurrence.js'

describe('expandRecurrence', () => {
  it('expands daily recurrence within range', () => {
    const result = expandRecurrence(
      '2026-04-01T09:00:00.000Z',
      'RRULE:FREQ=DAILY',
      '2026-04-01',
      '2026-04-03',
    )
    expect(result).toHaveLength(3)
  })

  it('expands weekly recurrence', () => {
    const result = expandRecurrence(
      '2026-04-01T09:00:00.000Z',
      'RRULE:FREQ=WEEKLY',
      '2026-04-01',
      '2026-04-30',
    )
    // Apr 1, 8, 15, 22, 29
    expect(result).toHaveLength(5)
  })

  it('expands monthly recurrence', () => {
    const result = expandRecurrence(
      '2026-01-15T09:00:00.000Z',
      'RRULE:FREQ=MONTHLY',
      '2026-01-01',
      '2026-06-30',
    )
    // Jan 15, Feb 15, Mar 15, Apr 15, May 15, Jun 15
    expect(result).toHaveLength(6)
  })

  it('returns empty for events starting after range', () => {
    const result = expandRecurrence(
      '2026-05-01T09:00:00.000Z',
      'RRULE:FREQ=DAILY',
      '2026-04-01',
      '2026-04-30',
    )
    expect(result).toHaveLength(0)
  })

  it('returns empty for invalid RRULE', () => {
    const result = expandRecurrence(
      '2026-04-01T09:00:00.000Z',
      'invalid',
      '2026-04-01',
      '2026-04-30',
    )
    expect(result).toHaveLength(0)
  })

  it('skips occurrences before range start', () => {
    const result = expandRecurrence(
      '2026-01-01T09:00:00.000Z',
      'RRULE:FREQ=MONTHLY',
      '2026-03-01',
      '2026-04-30',
    )
    // Mar 1, Apr 1
    expect(result).toHaveLength(2)
  })
})

describe('RECURRENCE_OPTIONS', () => {
  it('has 4 options', () => {
    expect(RECURRENCE_OPTIONS).toHaveLength(4)
  })

  it('has "Does not repeat" as first option', () => {
    expect(RECURRENCE_OPTIONS[0]!.label).toBe('Does not repeat')
    expect(RECURRENCE_OPTIONS[0]!.value).toBe('')
  })
})
