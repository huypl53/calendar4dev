import { Hono } from 'hono'
import * as calendarService from '../services/calendars.js'
import * as eventService from '../services/events.js'
import { serializeICS, parseICS } from '../lib/ics.js'
import { ValidationError } from '../lib/errors.js'

type AppEnv = { Variables: { user: { id: string }; session: unknown } }

function serializeCalendar(cal: Record<string, unknown>) {
  return {
    id: cal.id,
    userId: cal.userId,
    name: cal.name,
    description: cal.description ?? null,
    color: cal.color,
    timezone: cal.timezone,
    isPrimary: cal.isPrimary,
    createdAt: cal.createdAt instanceof Date ? cal.createdAt.toISOString() : String(cal.createdAt),
    updatedAt: cal.updatedAt instanceof Date ? cal.updatedAt.toISOString() : String(cal.updatedAt),
  }
}

const app = new Hono<AppEnv>()

// GET /api/calendars
app.get('/api/calendars', async (c) => {
  const user = c.get('user')
  const calendars = await calendarService.listCalendars(user.id)
  return c.json({ data: calendars.map((cal) => serializeCalendar(cal)) })
})

// POST /api/calendars/bootstrap
app.post('/api/calendars/bootstrap', async (c) => {
  const user = c.get('user')
  const calendar = await calendarService.bootstrapCalendar(user.id)
  return c.json({ data: serializeCalendar(calendar) })
})

// GET /api/calendars/:id/export.ics
app.get('/api/calendars/:id/export.ics', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const calendar = await calendarService.getCalendarForOwner(id, user.id)
  const events = await eventService.listEvents(user.id, { calendarId: id })
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
  c.header('Content-Disposition', `attachment; filename="${encodeURIComponent(String(calendar.name))}.ics"`)
  return c.text(icsContent)
})

// POST /api/calendars/:id/import
app.post('/api/calendars/:id/import', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  await calendarService.getCalendarForOwner(id, user.id)

  const body = await c.req.text()
  if (!body.trim()) throw new ValidationError('Request body is empty')

  const parsed = parseICS(body)
  if (parsed.length === 0) return c.json({ imported: 0 })
  if (parsed.length > 500) throw new ValidationError('File contains more than 500 events')

  let imported = 0
  for (const ev of parsed) {
    await eventService.createEvent(
      {
        calendarId: id,
        title: ev.title,
        startTime: ev.startTime.toISOString(),
        endTime: ev.endTime.toISOString(),
        description: ev.description,
        allDay: ev.allDay,
        recurrenceRule: ev.recurrenceRule ?? undefined,
      },
      user.id,
    )
    imported++
  }
  return c.json({ imported })
})

export default app
