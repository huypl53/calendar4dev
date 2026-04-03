import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { calendars } from '../db/schema/calendars.js'

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

  const [calendar] = await db.insert(calendars).values({
    userId,
    name: 'Personal',
    isPrimary: true,
    color: '#2f81f7',
  }).returning()

  return calendar!
}
