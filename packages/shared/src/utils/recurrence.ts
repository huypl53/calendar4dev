/**
 * Simple RRULE expansion for MVP. Supports FREQ=DAILY, WEEKLY, MONTHLY.
 * Returns occurrence start dates within the given date range.
 */
export function expandRecurrence(
  startTime: string,
  recurrenceRule: string,
  rangeStart: string,
  rangeEnd: string,
): string[] {
  const freq = parseFrequency(recurrenceRule)
  if (!freq) return []

  const eventStart = new Date(startTime)
  const rangeLo = new Date(rangeStart + 'T00:00:00')
  const rangeHi = new Date(rangeEnd + 'T23:59:59')
  const occurrences: string[] = []

  // Generate occurrences from event start up to range end
  const current = new Date(eventStart)
  const maxIterations = 365 * 2 // safety cap

  for (let i = 0; i < maxIterations; i++) {
    if (current > rangeHi) break

    if (current >= rangeLo) {
      occurrences.push(current.toISOString())
    }

    // Advance to next occurrence
    if (freq === 'DAILY') {
      current.setDate(current.getDate() + 1)
    } else if (freq === 'WEEKLY') {
      current.setDate(current.getDate() + 7)
    } else if (freq === 'MONTHLY') {
      current.setMonth(current.getMonth() + 1)
    }
  }

  return occurrences
}

function parseFrequency(rule: string): 'DAILY' | 'WEEKLY' | 'MONTHLY' | null {
  const match = rule.match(/FREQ=(DAILY|WEEKLY|MONTHLY)/)
  return match ? (match[1] as 'DAILY' | 'WEEKLY' | 'MONTHLY') : null
}

export const RECURRENCE_OPTIONS = [
  { value: '', label: 'Does not repeat' },
  { value: 'RRULE:FREQ=DAILY', label: 'Daily' },
  { value: 'RRULE:FREQ=WEEKLY', label: 'Weekly' },
  { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
] as const
