import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { calendars } from '../db/schema/calendars.js'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'

export async function getCalendarForOwner(calendarId: string, userId: string) {
  const calendar = await db.query.calendars.findFirst({ where: eq(calendars.id, calendarId) })
  if (!calendar) throw new NotFoundError('Calendar not found')
  if (calendar.userId !== userId) throw new ForbiddenError('Not calendar owner')
  return calendar
}

export async function listCalendars(userId: string) {
  return db.query.calendars.findMany({
    where: eq(calendars.userId, userId),
    orderBy: calendars.createdAt,
  })
}

export async function bootstrapCalendar(userId: string) {
  const existing = await db.query.calendars.findFirst({
    where: eq(calendars.userId, userId),
  })
  if (existing) return existing

  try {
    const [calendar] = await db.insert(calendars).values({
      userId,
      name: 'Personal',
      isPrimary: true,
      color: '#2f81f7',
    }).returning()

    return calendar!
  } catch {
    // Handle race condition: if concurrent request already inserted, fetch it
    const fallback = await db.query.calendars.findFirst({
      where: eq(calendars.userId, userId),
    })
    if (fallback) return fallback
    throw new Error('Failed to bootstrap calendar')
  }
}
