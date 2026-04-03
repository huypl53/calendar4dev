import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users } from './users.js'
import { sessions } from './sessions.js'
import { accounts } from './accounts.js'
import { verifications } from './verifications.js'
import { calendars, calendarMembers } from './calendars.js'
import { events, eventExceptions } from './events.js'

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertSessionSchema = createInsertSchema(sessions)
export const selectSessionSchema = createSelectSchema(sessions)

export const insertAccountSchema = createInsertSchema(accounts)
export const selectAccountSchema = createSelectSchema(accounts)

export const insertVerificationSchema = createInsertSchema(verifications)
export const selectVerificationSchema = createSelectSchema(verifications)

export const insertCalendarSchema = createInsertSchema(calendars)
export const selectCalendarSchema = createSelectSchema(calendars)

export const insertCalendarMemberSchema = createInsertSchema(calendarMembers)
export const selectCalendarMemberSchema = createSelectSchema(calendarMembers)

export const insertEventSchema = createInsertSchema(events)
export const selectEventSchema = createSelectSchema(events)

export const insertEventExceptionSchema = createInsertSchema(eventExceptions)
export const selectEventExceptionSchema = createSelectSchema(eventExceptions)
