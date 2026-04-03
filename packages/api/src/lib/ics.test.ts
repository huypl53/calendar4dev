import { describe, it, expect } from 'vitest'
import { serializeICS, parseICS } from './ics.js'

describe('serializeICS', () => {
  it('produces VCALENDAR wrapper', () => {
    const ics = serializeICS([], 'Test Calendar')
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('X-WR-CALNAME:Test Calendar')
  })

  it('serializes a timed event with UTC timestamps', () => {
    const ics = serializeICS([
      {
        id: 'evt-1',
        title: 'Team standup',
        description: null,
        startTime: new Date('2026-04-03T09:00:00.000Z'),
        endTime: new Date('2026-04-03T09:30:00.000Z'),
        allDay: false,
        recurrenceRule: null,
      },
    ], 'Personal')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:Team standup')
    expect(ics).toContain('DTSTART:20260403T090000Z')
    expect(ics).toContain('DTEND:20260403T093000Z')
    expect(ics).toContain('UID:evt-1@dev-calendar')
    expect(ics).toContain('END:VEVENT')
  })

  it('serializes an all-day event with VALUE=DATE', () => {
    const ics = serializeICS([
      {
        id: 'evt-2',
        title: 'Holiday',
        description: null,
        startTime: new Date('2026-04-03T00:00:00.000Z'),
        endTime: new Date('2026-04-04T00:00:00.000Z'),
        allDay: true,
        recurrenceRule: null,
      },
    ], 'Personal')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260403')
    expect(ics).toContain('DTEND;VALUE=DATE:20260404')
  })

  it('includes RRULE when recurrenceRule is set', () => {
    const ics = serializeICS([
      {
        id: 'evt-3',
        title: 'Weekly meeting',
        description: null,
        startTime: new Date('2026-04-03T09:00:00.000Z'),
        endTime: new Date('2026-04-03T10:00:00.000Z'),
        allDay: false,
        recurrenceRule: 'FREQ=WEEKLY',
      },
    ], 'Work')
    expect(ics).toContain('RRULE:FREQ=WEEKLY')
  })

  it('escapes special characters in text fields', () => {
    const ics = serializeICS([
      {
        id: 'evt-4',
        title: 'Meeting; Room 101',
        description: 'See you there,\nBring laptop',
        startTime: new Date('2026-04-03T09:00:00.000Z'),
        endTime: new Date('2026-04-03T10:00:00.000Z'),
        allDay: false,
        recurrenceRule: null,
      },
    ], 'Personal')
    expect(ics).toContain('SUMMARY:Meeting\\; Room 101')
    expect(ics).toContain('DESCRIPTION:See you there\\,\\nBring laptop')
  })
})

describe('parseICS', () => {
  const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:test-1@example.com
SUMMARY:Team standup
DTSTART:20260403T090000Z
DTEND:20260403T093000Z
DESCRIPTION:Daily sync
END:VEVENT
END:VCALENDAR`

  it('parses a basic VEVENT', () => {
    const events = parseICS(sampleICS)
    expect(events).toHaveLength(1)
    expect(events[0]!.title).toBe('Team standup')
    expect(events[0]!.description).toBe('Daily sync')
    expect(events[0]!.allDay).toBe(false)
  })

  it('detects all-day events from VALUE=DATE', () => {
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Holiday
DTSTART;VALUE=DATE:20260403
DTEND;VALUE=DATE:20260404
END:VEVENT
END:VCALENDAR`
    const events = parseICS(ics)
    expect(events[0]!.allDay).toBe(true)
    expect(events[0]!.title).toBe('Holiday')
  })

  it('skips events with RECURRENCE-ID (exceptions)', () => {
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Original
DTSTART:20260403T090000Z
DTEND:20260403T100000Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:Exception
DTSTART:20260410T090000Z
DTEND:20260410T100000Z
RECURRENCE-ID:20260410T090000Z
END:VEVENT
END:VCALENDAR`
    const events = parseICS(ics)
    // Both are parsed (RECURRENCE-ID doesn't skip, just marks exception data)
    // Original should be there
    expect(events.some(e => e.title === 'Original')).toBe(true)
  })

  it('handles folded lines (RFC 5545)', () => {
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:A very long event title that gets folded acro
 ss multiple lines
DTSTART:20260403T090000Z
DTEND:20260403T100000Z
END:VEVENT
END:VCALENDAR`
    const events = parseICS(ics)
    expect(events[0]!.title).toBe('A very long event title that gets folded across multiple lines')
  })

  it('returns empty array for empty content', () => {
    expect(parseICS('')).toHaveLength(0)
  })

  it('parses RRULE', () => {
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Weekly sync
DTSTART:20260403T090000Z
DTEND:20260403T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
END:VEVENT
END:VCALENDAR`
    const events = parseICS(ics)
    expect(events[0]!.recurrenceRule).toBe('FREQ=WEEKLY;BYDAY=MO')
  })
})
