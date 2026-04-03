/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
export function getTodayDate(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Returns true if the string is a valid YYYY-MM-DD date. */
export function isValidDateParam(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false
  const parts = value.split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  const d = new Date(year, month - 1, day)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

/** Returns true if the given YYYY-MM-DD string is today's date. */
export function isToday(date: string): boolean {
  return date === getTodayDate()
}

function toDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Returns 7 YYYY-MM-DD dates for the week containing the given date (Monday start). */
export function getWeekDays(date: string): string[] {
  const d = toDate(date)
  const dayOfWeek = d.getDay()
  // Monday = 0, Sunday = 6
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)

  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    days.push(formatDate(day))
  }
  return days
}

/** Returns the Monday YYYY-MM-DD for the week containing the given date. */
export function getWeekStart(date: string): string {
  return getWeekDays(date)[0]!
}

/** Returns the day name and number for a date header. */
export function formatDayHeader(date: string): { dayName: string; dayNumber: number } {
  const d = toDate(date)
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  return { dayName, dayNumber: d.getDate() }
}

/** Returns an array of month dates for a calendar grid (6 weeks × 7 days). */
export function getMonthGridDates(date: string): string[] {
  const d = toDate(date)
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1)
  const dayOfWeek = firstOfMonth.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(firstOfMonth.getDate() + mondayOffset)

  const dates: string[] = []
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + i)
    dates.push(formatDate(day))
  }
  return dates
}

/** Returns true if the date is in the given month (YYYY-MM-DD, compared to another YYYY-MM-DD). */
export function isSameMonth(date: string, reference: string): boolean {
  return date.slice(0, 7) === reference.slice(0, 7)
}

/** Adds days to a YYYY-MM-DD date and returns the result as YYYY-MM-DD. */
export function addDays(date: string, days: number): string {
  const d = toDate(date)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

/** Adds months to a YYYY-MM-DD date. Clamps day to last day of target month. */
export function addMonths(date: string, months: number): string {
  const d = toDate(date)
  const targetMonth = d.getMonth() + months
  d.setMonth(targetMonth)
  // Clamp: if day overflowed into next month (e.g. Jan 31 + 1mo → Mar 3), set to last day of target month
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0)
  }
  return formatDate(d)
}

/** Format hour for time gutter (12 AM, 1 AM, ... 11 PM). */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

type ViewType = 'day' | 'week' | 'month' | 'schedule'

/** Returns a human-readable date label for the header based on view type. */
export function getDateLabel(view: ViewType, date: string): string {
  const d = toDate(date)
  if (view === 'day') {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  if (view === 'month') {
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  if (view === 'week') {
    const days = getWeekDays(date)
    const start = toDate(days[0]!)
    const end = toDate(days[6]!)
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${startStr} – ${endStr}`
  }
  return 'Schedule'
}

/** Returns the new date string after navigating forward/back in the given view. */
export function navigateDate(view: ViewType, date: string, direction: 1 | -1): string {
  if (view === 'day') return addDays(date, direction)
  if (view === 'week') return addDays(date, 7 * direction)
  if (view === 'month') return addMonths(date, direction)
  return date
}
