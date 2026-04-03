import { z } from 'zod'

const hexColorRegex = /^#[0-9a-fA-F]{6}$/

const ianaTimezone = z.string().min(1).max(64).refine(
  (tz) => { try { Intl.DateTimeFormat(undefined, { timeZone: tz }); return true } catch { return false } },
  { message: 'Invalid IANA timezone' },
)

export const createCalendarSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(hexColorRegex, 'Must be a valid hex color').toLowerCase().optional(),
  timezone: ianaTimezone.optional(),
  isPrimary: z.boolean().optional(),
})

export type CreateCalendar = z.infer<typeof createCalendarSchema>

export const updateCalendarSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(hexColorRegex, 'Must be a valid hex color').toLowerCase().optional(),
  timezone: ianaTimezone.optional(),
  isPrimary: z.boolean().optional(),
})

export type UpdateCalendar = z.infer<typeof updateCalendarSchema>

export const addCalendarMemberSchema = z.object({
  email: z.string().email(),
  permissionLevel: z.enum(['details', 'edit', 'admin']),
})

export type AddCalendarMember = z.infer<typeof addCalendarMemberSchema>

export const updateCalendarMemberSchema = z.object({
  permissionLevel: z.enum(['details', 'edit', 'admin']),
})

export type UpdateCalendarMember = z.infer<typeof updateCalendarMemberSchema>
