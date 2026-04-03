import { Hono } from 'hono'
import { addCalendarMemberSchema, updateCalendarMemberSchema } from '@dev-calendar/shared'
import { ValidationError } from '../lib/errors.js'
import * as membersService from '../services/calendar-members.js'

type AppEnv = { Variables: { user: { id: string }; session: unknown } }

function serializeMember(m: Record<string, unknown>) {
  return {
    id: m.id,
    calendarId: m.calendarId,
    userId: m.userId,
    userEmail: m.userEmail,
    userName: m.userName ?? null,
    permissionLevel: m.permissionLevel,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
  }
}

function serializeSharedCalendar(c: Record<string, unknown>) {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? null,
    color: c.color,
    timezone: c.timezone,
    isPrimary: c.isPrimary,
    permissionLevel: c.permissionLevel,
    ownerEmail: c.ownerEmail,
    ownerName: c.ownerName ?? null,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
  }
}

const app = new Hono<AppEnv>()

// GET /api/calendars/shared — calendars shared with the current user
app.get('/api/calendars/shared', async (c) => {
  const user = c.get('user')
  const shared = await membersService.listSharedCalendars(user.id)
  return c.json({ data: shared.map((s) => serializeSharedCalendar(s as Record<string, unknown>)) })
})

// GET /api/calendars/:id/members
app.get('/api/calendars/:id/members', async (c) => {
  const calendarId = c.req.param('id')
  const user = c.get('user')
  const members = await membersService.listMembers(calendarId, user.id)
  return c.json({ data: members.map((m) => serializeMember(m as Record<string, unknown>)) })
})

// POST /api/calendars/:id/members
app.post('/api/calendars/:id/members', async (c) => {
  const calendarId = c.req.param('id')
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
  const parsed = addCalendarMemberSchema.safeParse(raw)
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.issues)
  const user = c.get('user')
  const member = await membersService.addMember(calendarId, parsed.data, user.id)
  return c.json({ data: serializeMember(member as Record<string, unknown>) }, 201)
})

// PATCH /api/calendars/:id/members/:memberId
app.patch('/api/calendars/:id/members/:memberId', async (c) => {
  const calendarId = c.req.param('id')
  const memberId = c.req.param('memberId')
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
  const parsed = updateCalendarMemberSchema.safeParse(raw)
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.issues)
  const user = c.get('user')
  const member = await membersService.updateMember(calendarId, memberId, parsed.data, user.id)
  return c.json({ data: serializeMember(member as Record<string, unknown>) })
})

// DELETE /api/calendars/:id/members/:memberId
app.delete('/api/calendars/:id/members/:memberId', async (c) => {
  const calendarId = c.req.param('id')
  const memberId = c.req.param('memberId')
  const user = c.get('user')
  await membersService.removeMember(calendarId, memberId, user.id)
  return c.body(null, 204)
})

export default app
