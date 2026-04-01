import { pgTable, pgEnum, varchar, text, boolean, timestamp, jsonb, index, uniqueIndex, customType } from 'drizzle-orm/pg-core'
import { sql, type SQL } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { calendars } from './calendars.js'

export const eventTypeEnum = pgEnum('event_type', [
  'standard', 'all_day', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location',
])

export const eventStatusEnum = pgEnum('event_status', ['busy', 'free'])

export const eventVisibilityEnum = pgEnum('event_visibility', ['public', 'private'])

export const exceptionTypeEnum = pgEnum('exception_type', ['cancelled', 'modified'])

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

export const events = pgTable('events', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  calendarId: varchar({ length: 128 }).notNull().references(() => calendars.id, { onDelete: 'cascade' }),
  title: varchar({ length: 500 }).notNull(),
  description: text(),
  startTime: timestamp({ withTimezone: true }).notNull(),
  endTime: timestamp({ withTimezone: true }).notNull(),
  allDay: boolean().notNull().default(false),
  location: varchar({ length: 500 }),
  color: varchar({ length: 7 }),
  status: eventStatusEnum().notNull().default('busy'),
  visibility: eventVisibilityEnum().notNull().default('public'),
  eventType: eventTypeEnum().notNull().default('standard'),
  recurrenceRule: text(),
  searchVector: tsvector('search_vector').generatedAlwaysAs((): SQL =>
    sql`setweight(to_tsvector('english', coalesce(${events.title}, '')), 'A') || setweight(to_tsvector('english', coalesce(${events.description}, '')), 'B') || setweight(to_tsvector('english', coalesce(${events.location}, '')), 'C')`
  ),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index('idx_events_calendar_id').on(t.calendarId),
  index('idx_events_start_time').on(t.startTime),
  index('idx_events_search').using('gin', t.searchVector),
])

export const eventExceptions = pgTable('event_exceptions', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  eventId: varchar({ length: 128 }).notNull().references(() => events.id, { onDelete: 'cascade' }),
  exceptionDate: timestamp({ withTimezone: true }).notNull(),
  exceptionType: exceptionTypeEnum().notNull(),
  modifiedEventData: jsonb(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('idx_event_exceptions_unique').on(t.eventId, t.exceptionDate),
])
