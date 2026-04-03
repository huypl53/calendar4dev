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
