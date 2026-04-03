import type { CalendarEvent } from './api-client.js'

/** Set of event IDs that have already fired a notification this session */
const notifiedIds = new Set<string>()

/** Request browser notification permission on first call */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

/**
 * Check the provided events list and fire browser notifications (or in-app toasts)
 * for events whose reminder window is currently active.
 *
 * `now` is injectable for testing.
 */
export function checkReminders(
  events: CalendarEvent[],
  onToast: (message: string) => void,
  now = new Date(),
): void {
  for (const event of events) {
    if (event.reminderMinutes === null || event.reminderMinutes === undefined) continue

    const startMs = new Date(event.startTime).getTime()
    const reminderMs = event.reminderMinutes * 60 * 1000
    const notifyAt = startMs - reminderMs

    // Fire if we're within the current minute window (±30s) of the notification time
    const diff = now.getTime() - notifyAt
    if (diff < -30_000 || diff > 90_000) continue

    const key = `${event.id}:${event.reminderMinutes}`
    if (notifiedIds.has(key)) continue
    notifiedIds.add(key)

    const timeLabel = new Date(event.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const body = `Starts at ${timeLabel}`

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(event.title, { body, icon: '/favicon.ico' })
      } catch {
        onToast(`Reminder: ${event.title} – ${body}`)
      }
    } else {
      onToast(`Reminder: ${event.title} – ${body}`)
    }
  }
}

/** Clear the notified set (useful for testing) */
export function clearNotifiedCache(): void {
  notifiedIds.clear()
}
