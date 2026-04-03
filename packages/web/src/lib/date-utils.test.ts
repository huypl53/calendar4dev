import { describe, it, expect } from 'vitest'
import {
  getWeekDays,
  formatDayHeader,
  isToday,
  getTodayDate,
  formatHour,
  getMonthGridDates,
  isSameMonth,
  addDays,
  addMonths,
} from './date-utils.js'

describe('getWeekDays', () => {
  it('returns 7 dates starting from Monday', () => {
    // 2026-04-01 is a Wednesday
    const days = getWeekDays('2026-04-01')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-03-30') // Monday
    expect(days[6]).toBe('2026-04-05') // Sunday
  })

  it('handles Sunday input (maps to previous Monday)', () => {
    // 2026-04-05 is a Sunday
    const days = getWeekDays('2026-04-05')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-03-30') // Monday
    expect(days[6]).toBe('2026-04-05') // Sunday
  })

  it('handles Monday input', () => {
    // 2026-03-30 is a Monday
    const days = getWeekDays('2026-03-30')
    expect(days[0]).toBe('2026-03-30')
    expect(days[6]).toBe('2026-04-05')
  })
})

describe('formatDayHeader', () => {
  it('returns day name and number', () => {
    const result = formatDayHeader('2026-04-01')
    expect(result.dayName).toBe('WED')
    expect(result.dayNumber).toBe(1)
  })

  it('returns correct info for a Monday', () => {
    const result = formatDayHeader('2026-03-30')
    expect(result.dayName).toBe('MON')
    expect(result.dayNumber).toBe(30)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(getTodayDate())).toBe(true)
  })

  it('returns false for a past date', () => {
    expect(isToday('2020-01-01')).toBe(false)
  })
})

describe('formatHour', () => {
  it('formats midnight', () => {
    expect(formatHour(0)).toBe('12 AM')
  })

  it('formats morning hours', () => {
    expect(formatHour(1)).toBe('1 AM')
    expect(formatHour(11)).toBe('11 AM')
  })

  it('formats noon', () => {
    expect(formatHour(12)).toBe('12 PM')
  })

  it('formats afternoon hours', () => {
    expect(formatHour(13)).toBe('1 PM')
    expect(formatHour(23)).toBe('11 PM')
  })
})

describe('getMonthGridDates', () => {
  it('returns 42 dates (6 weeks)', () => {
    const dates = getMonthGridDates('2026-04-01')
    expect(dates).toHaveLength(42)
  })

  it('starts on a Monday', () => {
    const dates = getMonthGridDates('2026-04-01')
    const first = new Date(
      ...dates[0]!.split('-').map(Number) as [number, number, number],
    )
    // Adjust month (0-indexed in Date constructor)
    const d = new Date(first.getFullYear(), first.getMonth() - 1, first.getDate())
    expect(d.getDay()).toBe(1) // Monday
  })
})

describe('isSameMonth', () => {
  it('returns true for same month', () => {
    expect(isSameMonth('2026-04-01', '2026-04-15')).toBe(true)
  })

  it('returns false for different months', () => {
    expect(isSameMonth('2026-03-30', '2026-04-15')).toBe(false)
  })
})

describe('addDays', () => {
  it('adds days forward', () => {
    expect(addDays('2026-04-01', 5)).toBe('2026-04-06')
  })

  it('subtracts days', () => {
    expect(addDays('2026-04-01', -1)).toBe('2026-03-31')
  })
})

describe('addMonths', () => {
  it('adds months forward', () => {
    expect(addMonths('2026-04-01', 1)).toBe('2026-05-01')
  })

  it('subtracts months', () => {
    expect(addMonths('2026-04-01', -1)).toBe('2026-03-01')
  })
})
