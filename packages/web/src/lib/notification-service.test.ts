import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkReminders, clearNotifiedCache } from './notification-service.js'
import type { CalendarEvent } from './api-client.js'

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt-1',
    calendarId: 'cal-1',
    title: 'Team standup',
    description: null,
    startTime: '2026-04-03T10:00:00.000Z',
    endTime: '2026-04-03T10:30:00.000Z',
    allDay: false,
    location: null,
    color: null,
    status: 'busy',
    visibility: 'public',
    eventType: 'standard',
    recurrenceRule: null,
    reminderMinutes: 15,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

// jsdom does not define Notification, so toast fallback is always used
describe('checkReminders', () => {
  beforeEach(() => {
    clearNotifiedCache()
  })

  it('fires toast when inside reminder window', () => {
    const onToast = vi.fn()
    const event = makeEvent({ reminderMinutes: 15 })
    const startMs = new Date(event.startTime).getTime()
    const now = new Date(startMs - 15 * 60 * 1000)

    checkReminders([event], onToast, now)
    expect(onToast).toHaveBeenCalledOnce()
    expect(onToast.mock.calls[0]?.[0]).toContain('Team standup')
  })

  it('does not fire when reminder is null', () => {
    const onToast = vi.fn()
    const event = makeEvent({ reminderMinutes: null })
    checkReminders([event], onToast, new Date())
    expect(onToast).not.toHaveBeenCalled()
  })

  it('does not fire when outside reminder window', () => {
    const onToast = vi.fn()
    const event = makeEvent({ reminderMinutes: 15 })
    // now = 2 hours before start — well outside 90s window
    const startMs = new Date(event.startTime).getTime()
    const now = new Date(startMs - 120 * 60 * 1000)
    checkReminders([event], onToast, now)
    expect(onToast).not.toHaveBeenCalled()
  })

  it('does not fire twice for the same event+reminder', () => {
    const onToast = vi.fn()
    const event = makeEvent({ reminderMinutes: 15 })
    const startMs = new Date(event.startTime).getTime()
    const now = new Date(startMs - 15 * 60 * 1000)

    checkReminders([event], onToast, now)
    checkReminders([event], onToast, now)
    expect(onToast).toHaveBeenCalledOnce()
  })

  it('fires for different events independently', () => {
    const onToast = vi.fn()
    const event1 = makeEvent({ id: 'e1', reminderMinutes: 15 })
    const event2 = makeEvent({ id: 'e2', title: 'Design review', reminderMinutes: 15 })
    const startMs = new Date(event1.startTime).getTime()
    const now = new Date(startMs - 15 * 60 * 1000)

    checkReminders([event1, event2], onToast, now)
    expect(onToast).toHaveBeenCalledTimes(2)
  })

  it('fires for 0-minute reminder at event start time', () => {
    const onToast = vi.fn()
    const event = makeEvent({ reminderMinutes: 0 })
    const startMs = new Date(event.startTime).getTime()
    const now = new Date(startMs) // exactly at start

    checkReminders([event], onToast, now)
    expect(onToast).toHaveBeenCalledOnce()
  })

  it('does not fire too early (before window)', () => {
    const onToast = vi.fn()
    const event = makeEvent({ reminderMinutes: 15 })
    const startMs = new Date(event.startTime).getTime()
    // 16 minutes before = 60s before the 15-min reminder fires
    const now = new Date(startMs - 16 * 60 * 1000)
    checkReminders([event], onToast, now)
    expect(onToast).not.toHaveBeenCalled()
  })
})
