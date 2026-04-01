import { pgTable, pgEnum, varchar, text, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { CALENDAR_PERMISSION_VALUES } from '@dev-calendar/shared'
import { users } from './users.js'

export const permissionLevelEnum = pgEnum('permission_level', CALENDAR_PERMISSION_VALUES)

export const calendars = pgTable('calendars', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar({ length: 128 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  color: varchar({ length: 7 }).notNull().default('#1f2937'),
  timezone: varchar({ length: 64 }).notNull().default('UTC'),
  isPrimary: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('idx_calendars_user_name').on(t.userId, t.name),
  index('idx_calendars_user_id').on(t.userId),
])

export const calendarMembers = pgTable('calendar_members', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  calendarId: varchar({ length: 128 }).notNull().references(() => calendars.id, { onDelete: 'cascade' }),
  userId: varchar({ length: 128 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  permissionLevel: permissionLevelEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('idx_calendar_members_unique').on(t.calendarId, t.userId),
  index('idx_calendar_members_user_id').on(t.userId),
])
