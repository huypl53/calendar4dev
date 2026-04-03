import { Hono } from 'hono'
import * as calendarService from '../services/calendars.js'

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

export default app
