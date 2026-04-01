import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users.js'

export const sessions = pgTable('sessions', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar({ length: 128 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar({ length: 255 }).notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_sessions_user_id').on(t.userId),
  index('idx_sessions_expires_at').on(t.expiresAt),
])
