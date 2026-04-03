/**
 * Minimal iCalendar (RFC 5545) serializer and parser for calendar events.
 */

export interface IcsEvent {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  allDay: boolean
  recurrenceRule: string | null
}

const _encoder = new TextEncoder()
function utf8Len(s: string): number { return _encoder.encode(s).length }

/** Fold a long iCal line at 75 octets per RFC 5545 §3.1 (counts UTF-8 bytes, not JS code units) */
function foldLine(line: string): string {
  if (utf8Len(line) <= 75) return line
  const chunks: string[] = []
  let current = ''
  let byteLen = 0
  // First chunk: 75 bytes; continuation chunks: content ≤ 74 bytes (leading space occupies 1 byte)
  let limit = 75
  for (const ch of line) {
    const chLen = utf8Len(ch)
    if (byteLen + chLen > limit) {
      chunks.push(current)
      current = ' ' + ch
      byteLen = 1 + chLen
      limit = 75  // total line ≤ 75 octets incl. leading space
    } else {
      current += ch
      byteLen += chLen
    }
  }
  if (current) chunks.push(current)
  return chunks.join('\r\n')
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function formatDt(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')  // YYYYMMDDTHHMMSSZ
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '')  // YYYYMMDD
}

export function serializeICS(events: IcsEvent[], calendarName: string): string {
  const dtstamp = formatDt(new Date())
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dev Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:${escapeText(calendarName)}`),
  ]

  for (const event of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.id}@dev-calendar`)
    lines.push(`DTSTAMP:${dtstamp}`)

    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatDate(event.startTime)}`)
      lines.push(`DTEND;VALUE=DATE:${formatDate(event.endTime)}`)
    } else {
      lines.push(`DTSTART:${formatDt(event.startTime)}`)
      lines.push(`DTEND:${formatDt(event.endTime)}`)
    }

    lines.push(foldLine(`SUMMARY:${escapeText(event.title)}`))
    if (event.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeText(event.description)}`))
    }
    if (event.recurrenceRule) {
      lines.push(foldLine(`RRULE:${event.recurrenceRule}`))
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

export interface ParsedEvent {
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  allDay: boolean
  recurrenceRule: string | null
}

/** Unfold iCal content lines (RFC 5545 §3.1) */
function unfold(raw: string): string[] {
  return raw
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r\n|\n|\r/)
    .filter((l) => l.length > 0)
}

function getPropertyValue(line: string): string {
  // Strip property name and any parameters (up to first ':').
  // Do not trim — RFC 5545 property values may have significant trailing whitespace.
  const colonIdx = line.indexOf(':')
  return colonIdx >= 0 ? line.slice(colonIdx + 1) : ''
}

function parseDt(value: string): Date {
  // Handles: YYYYMMDDTHHMMSSZ, YYYYMMDD
  if (value.length === 8) {
    // All-day: YYYYMMDD
    const y = parseInt(value.slice(0, 4))
    const m = parseInt(value.slice(4, 6)) - 1
    const d = parseInt(value.slice(6, 8))
    return new Date(Date.UTC(y, m, d))
  }
  // Timed: strip non-numeric except T and Z
  const cleaned = value.replace(/[^0-9TZ]/g, '')
  return new Date(
    cleaned.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/, '$1-$2-$3T$4:$5:$6Z'),
  )
}

function unescapeText(s: string): string {
  return s.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

export function parseICS(content: string): ParsedEvent[] {
  const lines = unfold(content)
  const events: ParsedEvent[] = []
  let inVEvent = false
  let current: Partial<Record<string, string>> = {}

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inVEvent = true
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      inVEvent = false
      if (current['SUMMARY'] && current['DTSTART']) {
        const startValue = current['DTSTART']!
        const endValue = current['DTEND'] ?? current['DTSTART']!
        const allDay = current['DTSTART_ALLDAY'] === '1'

        const startTime = parseDt(startValue)
        const endTime = parseDt(endValue)

        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          events.push({
            title: unescapeText(current['SUMMARY'] ?? ''),
            description: current['DESCRIPTION'] ? unescapeText(current['DESCRIPTION']) : null,
            startTime,
            endTime,
            allDay,
            recurrenceRule: current['RRULE'] ?? null,
          })
        }
      }
      continue
    }

    if (!inVEvent) continue

    // Skip recurrence exceptions
    if (line.startsWith('RECURRENCE-ID')) continue

    const propName = line.split(/[;:]/)[0]!.toUpperCase()

    if (propName === 'SUMMARY') {
      current['SUMMARY'] = getPropertyValue(line)
    } else if (propName === 'DESCRIPTION') {
      current['DESCRIPTION'] = getPropertyValue(line)
    } else if (propName === 'RRULE') {
      current['RRULE'] = getPropertyValue(line)
    } else if (propName === 'DTSTART') {
      const val = getPropertyValue(line)
      current['DTSTART'] = val
      // Detect VALUE=DATE for allDay
      if (line.includes('VALUE=DATE') || val.length === 8) {
        current['DTSTART_ALLDAY'] = '1'
      }
    } else if (propName === 'DTEND') {
      current['DTEND'] = getPropertyValue(line)
    }
  }

  return events
}
