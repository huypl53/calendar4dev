import { describe, it, expect } from 'vitest'
import { getMinuteOfDay, computeNewStartMinute, setMinuteOfDay } from './drag-time.js'

describe('getMinuteOfDay', () => {
  it('returns 0 for midnight', () => {
    // Create a date at local midnight
    const d = new Date(2026, 3, 3, 0, 0, 0) // local midnight
    expect(getMinuteOfDay(d.toISOString())).toBe(0)
  })

  it('returns 600 for 10:00 AM', () => {
    const d = new Date(2026, 3, 3, 10, 0, 0)
    expect(getMinuteOfDay(d.toISOString())).toBe(600)
  })

  it('returns 615 for 10:15 AM', () => {
    const d = new Date(2026, 3, 3, 10, 15, 0)
    expect(getMinuteOfDay(d.toISOString())).toBe(615)
  })

  it('returns 1439 for 23:59', () => {
    const d = new Date(2026, 3, 3, 23, 59, 0)
    expect(getMinuteOfDay(d.toISOString())).toBe(1439)
  })
})

describe('computeNewStartMinute', () => {
  const gridHeight = 1440 // 1px per minute

  it('returns same position when deltaY is 0', () => {
    expect(computeNewStartMinute(600, 60, 0, gridHeight)).toBe(600)
  })

  it('moves forward by 15 minutes when delta is 15px', () => {
    expect(computeNewStartMinute(600, 60, 15, gridHeight)).toBe(615)
  })

  it('moves backward by 30 minutes when delta is -30px', () => {
    expect(computeNewStartMinute(600, 60, -30, gridHeight)).toBe(570)
  })

  it('snaps to nearest 15-minute interval', () => {
    // 7px delta = 7 minutes raw, snaps to 0 (nearest 15)
    expect(computeNewStartMinute(600, 60, 7, gridHeight)).toBe(600)
    // 8px delta = 8 minutes raw, snaps to 15 (nearest 15)
    expect(computeNewStartMinute(600, 60, 8, gridHeight)).toBe(615)
  })

  it('clamps to 0 at top of day', () => {
    expect(computeNewStartMinute(10, 60, -100, gridHeight)).toBe(0)
  })

  it('clamps so event end does not exceed 1440', () => {
    // 60-min event starting at 1380 would end at 1440 — OK
    // Starting at 1381 would end at 1441 — clamped to 1380
    expect(computeNewStartMinute(1400, 60, 100, gridHeight)).toBe(1380)
  })
})

describe('setMinuteOfDay', () => {
  it('sets time to 10:00 AM local', () => {
    const d = new Date(2026, 3, 3, 9, 0, 0)
    const result = new Date(setMinuteOfDay(d.toISOString(), 600))
    expect(result.getHours()).toBe(10)
    expect(result.getMinutes()).toBe(0)
  })

  it('preserves the date', () => {
    const d = new Date(2026, 3, 3, 9, 0, 0)
    const result = new Date(setMinuteOfDay(d.toISOString(), 600))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(3)
    expect(result.getDate()).toBe(3)
  })

  it('handles fractional minutes (rounds to 0 seconds)', () => {
    const d = new Date(2026, 3, 3, 9, 0, 0)
    const result = new Date(setMinuteOfDay(d.toISOString(), 615))
    expect(result.getHours()).toBe(10)
    expect(result.getMinutes()).toBe(15)
    expect(result.getSeconds()).toBe(0)
  })
})
