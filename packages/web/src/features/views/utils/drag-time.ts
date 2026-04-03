/**
 * Utility functions for event drag-and-drop time calculations.
 */

/** Returns the minute of day (0–1439) from an ISO datetime string */
export function getMinuteOfDay(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * Given a pixel delta (how far the cursor moved vertically),
 * the total grid height in pixels (for 24 hours),
 * and the original start minute, compute the new snapped start minute.
 *
 * Snaps to 15-minute intervals. Clamps to [0, 1440 - durationMinutes].
 */
export function computeNewStartMinute(
  originalStartMinutes: number,
  durationMinutes: number,
  deltaY: number,
  gridHeight: number,
): number {
  const minutesPerPx = 1440 / gridHeight
  const rawOffset = deltaY * minutesPerPx
  const snappedOffset = Math.round(rawOffset / 15) * 15
  const maxStart = 1440 - durationMinutes
  return Math.max(0, Math.min(maxStart, originalStartMinutes + snappedOffset))
}

/**
 * Returns a new ISO string with the same local date but the given minute-of-day.
 * Hours/minutes are treated in local time to match how the grid displays events.
 */
export function setMinuteOfDay(iso: string, totalMinutes: number): string {
  const d = new Date(iso)
  const newDate = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    Math.floor(totalMinutes / 60),
    totalMinutes % 60,
    0,
    0,
  )
  return newDate.toISOString()
}
