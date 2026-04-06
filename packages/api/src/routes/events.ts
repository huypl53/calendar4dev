import { Hono } from 'hono'
import { createEventSchema, updateEventSchema } from '@dev-calendar/shared'
import { ValidationError } from '../lib/errors.js'
import * as eventService from '../services/events.js'

type AppEnv = { Variables: { user: { id: string } } }

function serializeEvent(event: Record<string, unknown>) {
  return {
    id: event.id,
    calendarId: event.calendarId,
    title: event.title,
    description: event.description ?? null,
    startTime: event.startTime instanceof Date ? event.startTime.toISOString() : String(event.startTime),
    endTime: event.endTime instanceof Date ? event.endTime.toISOString() : String(event.endTime),
    allDay: event.allDay,
    location: event.location ?? null,
    color: event.color ?? null,
    status: event.status,
    visibility: event.visibility,
    eventType: event.eventType,
    recurrenceRule: event.recurrenceRule ?? null,
    reminderMinutes: event.reminderMinutes ?? null,
    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt),
    updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : String(event.updatedAt),
  }
}

const app = new Hono<AppEnv>()

// POST /api/events
app.post('/api/events', async (c) => {
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
  const parsed = createEventSchema.safeParse(raw)
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.issues)
  const user = c.get('user')
  const event = await eventService.createEvent(parsed.data, user.id)
  return c.json({ data: serializeEvent(event) }, 201)
})

// GET /api/events/search?q=<query>
app.get('/api/events/search', async (c) => {
  const q = c.req.query('q') ?? ''
  if (q.trim().length < 2) {
    return c.json({ data: [] })
  }
  const user = c.get('user')
  const results = await eventService.searchEvents(user.id, q)
  return c.json({ data: results.map((e) => serializeEvent(e as Record<string, unknown>)) })
})

// GET /api/events
app.get('/api/events', async (c) => {
  const calendarId = c.req.query('calendarId')
  const startDate = c.req.query('startDate')
  const endDate = c.req.query('endDate')
  const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
  if (startDate && (!ISO_DATE_RE.test(startDate) || isNaN(new Date(startDate).getTime()))) {
    throw new ValidationError('startDate must be a valid YYYY-MM-DD date')
  }
  if (endDate && (!ISO_DATE_RE.test(endDate) || isNaN(new Date(endDate).getTime()))) {
    throw new ValidationError('endDate must be a valid YYYY-MM-DD date')
  }
  const user = c.get('user')
  const events = await eventService.listEvents(user.id, { calendarId, startDate, endDate })
  return c.json({ data: events.map((e) => serializeEvent(e)) })
})

// GET /api/events/:id
app.get('/api/events/:id', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const event = await eventService.getEvent(id, user.id)
  return c.json({ data: serializeEvent(event) })
})

// PATCH /api/events/:id
app.patch('/api/events/:id', async (c) => {
  const id = c.req.param('id')
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
  const parsed = updateEventSchema.safeParse(raw)
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.issues)
  const user = c.get('user')
  const event = await eventService.updateEvent(id, parsed.data, user.id)
  return c.json({ data: serializeEvent(event) })
})

// DELETE /api/events/:id
app.delete('/api/events/:id', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  await eventService.deleteEvent(id, user.id)
  return c.body(null, 204)
})

export default app
