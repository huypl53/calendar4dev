import { z } from 'zod'

const hexColorRegex = /^#[0-9a-fA-F]{6}$/

export const createCalendarSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(hexColorRegex, 'Must be a valid hex color').toLowerCase().optional(),
  timezone: z.string().min(1).max(64).optional(),
  isPrimary: z.boolean().optional(),
})

export type CreateCalendar = z.infer<typeof createCalendarSchema>

export const updateCalendarSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(hexColorRegex, 'Must be a valid hex color').toLowerCase().optional(),
  timezone: z.string().min(1).max(64).optional(),
  isPrimary: z.boolean().optional(),
})

export type UpdateCalendar = z.infer<typeof updateCalendarSchema>
