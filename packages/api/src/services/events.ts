import { eq, and, gte, lt, inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import { events } from '../db/schema/events.js'
import { calendars, calendarMembers } from '../db/schema/calendars.js'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'
import type { CreateEvent, UpdateEvent } from '@dev-calendar/shared'

async function assertCalendarOwner(calendarId: string, userId: string) {
  const calendar = await db.query.calendars.findFirst({
    where: eq(calendars.id, calendarId),
  })
  if (!calendar) throw new NotFoundError('Calendar not found')
  if (calendar.userId !== userId) throw new ForbiddenError('Not calendar owner')
  return calendar
}

async function assertEventAccess(eventId: string, userId: string, requireEdit = false) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })
  if (!event) throw new NotFoundError('Event not found')

  const calendar = await db.query.calendars.findFirst({
    where: eq(calendars.id, event.calendarId),
  })
  if (!calendar) throw new NotFoundError('Calendar not found')

  // Owner can do anything
  if (calendar.userId === userId) return event

  // Check shared membership
  const membership = await db.query.calendarMembers.findFirst({
    where: and(eq(calendarMembers.calendarId, event.calendarId), eq(calendarMembers.userId, userId)),
  })

  if (!membership) throw new ForbiddenError('No access to this event')

  if (requireEdit && membership.permissionLevel === 'details') {
    throw new ForbiddenError('Read-only access to this calendar')
  }

  return event
}

export async function createEvent(data: CreateEvent, userId: string) {
  await assertCalendarOwner(data.calendarId, userId)

  const [event] = await db.insert(events).values({
    calendarId: data.calendarId,
    title: data.title,
    description: data.description ?? null,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    allDay: data.allDay ?? false,
    location: data.location ?? null,
    color: data.color ?? null,
    status: data.status ?? 'busy',
    visibility: data.visibility ?? 'public',
    eventType: data.eventType ?? 'standard',
    recurrenceRule: data.recurrenceRule ?? null,
  }).returning()

  return event!
}

export async function getEvent(eventId: string, userId: string) {
  return assertEventAccess(eventId, userId)
}

export async function listEvents(
  userId: string,
  filters: { calendarId?: string; startDate?: string; endDate?: string },
) {
  // Get owned calendar IDs
  const userCalendars = await db.query.calendars.findMany({
    where: eq(calendars.userId, userId),
    columns: { id: true },
  })
  const ownedIds = userCalendars.map((c) => c.id)

  // Get shared calendar IDs (where user is a member with ≥ details permission)
  const memberships = await db.query.calendarMembers.findMany({
    where: eq(calendarMembers.userId, userId),
    columns: { calendarId: true },
  })
  const sharedIds = memberships.map((m) => m.calendarId)

  const allCalendarIds = [...new Set([...ownedIds, ...sharedIds])]
  if (allCalendarIds.length === 0) return []

  const conditions = []

  if (filters.calendarId) {
    if (!allCalendarIds.includes(filters.calendarId)) {
      throw new ForbiddenError('No access to this calendar')
    }
    conditions.push(eq(events.calendarId, filters.calendarId))
  } else {
    conditions.push(inArray(events.calendarId, allCalendarIds))
  }

  // Overlap semantics: event overlaps range if endTime >= rangeStart AND startTime < rangeEnd+1day
  if (filters.startDate) {
    conditions.push(gte(events.endTime, new Date(filters.startDate + 'T00:00:00.000Z')))
  }
  if (filters.endDate) {
    const nextDay = new Date(filters.endDate + 'T00:00:00.000Z')
    nextDay.setDate(nextDay.getDate() + 1)
    conditions.push(lt(events.startTime, nextDay))
  }

  return db.query.events.findMany({
    where: and(...conditions),
    orderBy: events.startTime,
  })
}

export async function updateEvent(eventId: string, data: UpdateEvent, userId: string) {
  const event = await assertEventAccess(eventId, userId, true)

  const values: Record<string, unknown> = {}
  if (data.title !== undefined) values.title = data.title
  if (data.description !== undefined) values.description = data.description
  if (data.startTime !== undefined) values.startTime = new Date(data.startTime)
  if (data.endTime !== undefined) values.endTime = new Date(data.endTime)
  if (data.allDay !== undefined) values.allDay = data.allDay
  if (data.location !== undefined) values.location = data.location
  if (data.color !== undefined) values.color = data.color
  if (data.status !== undefined) values.status = data.status
  if (data.visibility !== undefined) values.visibility = data.visibility
  if (data.eventType !== undefined) values.eventType = data.eventType
  if (data.recurrenceRule !== undefined) values.recurrenceRule = data.recurrenceRule

  if (Object.keys(values).length === 0) {
    return event
  }

  const [updated] = await db.update(events)
    .set(values)
    .where(eq(events.id, eventId))
    .returning()

  return updated!
}

export async function deleteEvent(eventId: string, userId: string) {
  await assertEventAccess(eventId, userId, true)
  await db.delete(events).where(eq(events.id, eventId))
}
