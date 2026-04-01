import { z } from 'zod'

const eventTypeValues = ['standard', 'all_day', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location'] as const
const eventStatusValues = ['busy', 'free'] as const
const eventVisibilityValues = ['public', 'private'] as const

export const createEventSchema = z.object({
  calendarId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().nullable().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  allDay: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').nullable().optional(),
  status: z.enum(eventStatusValues).optional(),
  visibility: z.enum(eventVisibilityValues).optional(),
  eventType: z.enum(eventTypeValues).optional(),
  recurrenceRule: z.string().nullable().optional(),
})

export type CreateEvent = z.infer<typeof createEventSchema>

export const updateEventSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').nullable().optional(),
  status: z.enum(eventStatusValues).optional(),
  visibility: z.enum(eventVisibilityValues).optional(),
  eventType: z.enum(eventTypeValues).optional(),
  recurrenceRule: z.string().nullable().optional(),
})

export type UpdateEvent = z.infer<typeof updateEventSchema>
