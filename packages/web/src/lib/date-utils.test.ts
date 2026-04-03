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
  getDateLabel,
  navigateDate,
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

  it('clamps day to last day of target month (Jan 31 + 1mo = Feb 28)', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('handles leap year (Jan 31 + 1mo in leap year = Feb 29)', () => {
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
  })
})

describe('getDateLabel', () => {
  it('returns full date for day view', () => {
    expect(getDateLabel('day', '2026-04-03')).toBe('April 3, 2026')
  })

  it('returns month and year for month view', () => {
    expect(getDateLabel('month', '2026-04-03')).toBe('April 2026')
  })

  it('returns date range for week view', () => {
    const label = getDateLabel('week', '2026-04-01')
    // Week of Apr 1 = Mar 30 – Apr 5
    expect(label).toContain('Mar')
    expect(label).toContain('Apr')
  })

  it('returns "Schedule" for schedule view', () => {
    expect(getDateLabel('schedule', '2026-04-03')).toBe('Schedule')
  })
})

describe('navigateDate', () => {
  it('navigates day view by ±1 day', () => {
    expect(navigateDate('day', '2026-04-03', 1)).toBe('2026-04-04')
    expect(navigateDate('day', '2026-04-03', -1)).toBe('2026-04-02')
  })

  it('navigates week view by ±7 days', () => {
    expect(navigateDate('week', '2026-04-03', 1)).toBe('2026-04-10')
    expect(navigateDate('week', '2026-04-03', -1)).toBe('2026-03-27')
  })

  it('navigates month view by ±1 month', () => {
    expect(navigateDate('month', '2026-04-03', 1)).toBe('2026-05-03')
    expect(navigateDate('month', '2026-04-03', -1)).toBe('2026-03-03')
  })

  it('returns same date for schedule view', () => {
    expect(navigateDate('schedule', '2026-04-03', 1)).toBe('2026-04-03')
  })
})
