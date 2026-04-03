import { Hono } from 'hono'
import * as calendarService from '../services/calendars.js'
import * as eventService from '../services/events.js'
import { serializeICS } from '../lib/ics.js'
import { NotFoundError } from '../lib/errors.js'

const app = new Hono()

// GET /api/ical/:token — public, no auth required
app.get('/api/ical/:token', async (c) => {
  const token = c.req.param('token')
  const calendar = await calendarService.getCalendarByShareToken(token)
  if (!calendar) throw new NotFoundError('Feed not found')

  // List events as the calendar owner (bypass shared-calendar check)
  const events = await eventService.listEventsForCalendar(String(calendar.id))
  const icsContent = serializeICS(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description ?? null,
      startTime: e.startTime instanceof Date ? e.startTime : new Date(String(e.startTime)),
      endTime: e.endTime instanceof Date ? e.endTime : new Date(String(e.endTime)),
      allDay: e.allDay,
      recurrenceRule: e.recurrenceRule ?? null,
    })),
    String(calendar.name),
  )
  c.header('Content-Type', 'text/calendar; charset=utf-8')
  // private: proxies/CDNs must not cache — a revoked token would otherwise still serve data
  c.header('Cache-Control', 'private, max-age=300')
  c.header('Content-Disposition', 'attachment; filename="calendar.ics"')
  return c.text(icsContent)
})

export default app
