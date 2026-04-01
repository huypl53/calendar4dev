import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const users = pgTable('users', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  passwordHash: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
})
