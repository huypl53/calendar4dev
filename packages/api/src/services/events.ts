import { eq, and, gte, lte } from 'drizzle-orm'
import { db } from '../db/client.js'
import { events } from '../db/schema/events.js'
import { calendars } from '../db/schema/calendars.js'
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

async function assertEventOwner(eventId: string, userId: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })
  if (!event) throw new NotFoundError('Event not found')
  await assertCalendarOwner(event.calendarId, userId)
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
  return assertEventOwner(eventId, userId)
}

export async function listEvents(
  userId: string,
  filters: { calendarId?: string; startDate?: string; endDate?: string },
) {
  // Get all user's calendar IDs
  const userCalendars = await db.query.calendars.findMany({
    where: eq(calendars.userId, userId),
    columns: { id: true },
  })
  const calendarIds = userCalendars.map((c) => c.id)
  if (calendarIds.length === 0) return []

  const conditions = []

  if (filters.calendarId) {
    if (!calendarIds.includes(filters.calendarId)) {
      throw new ForbiddenError('Not calendar owner')
    }
    conditions.push(eq(events.calendarId, filters.calendarId))
  } else {
    // Import inArray for multi-calendar filtering
    const { inArray } = await import('drizzle-orm')
    conditions.push(inArray(events.calendarId, calendarIds))
  }

  if (filters.startDate) {
    conditions.push(gte(events.startTime, new Date(filters.startDate)))
  }
  if (filters.endDate) {
    conditions.push(lte(events.endTime, new Date(filters.endDate)))
  }

  return db.query.events.findMany({
    where: and(...conditions),
    orderBy: events.startTime,
  })
}

export async function updateEvent(eventId: string, data: UpdateEvent, userId: string) {
  await assertEventOwner(eventId, userId)

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
    return assertEventOwner(eventId, userId)
  }

  const [updated] = await db.update(events)
    .set(values)
    .where(eq(events.id, eventId))
    .returning()

  return updated!
}

export async function deleteEvent(eventId: string, userId: string) {
  await assertEventOwner(eventId, userId)

  await db.delete(events).where(eq(events.id, eventId))
}
