import { z } from 'zod'
import { EVENT_TYPE_VALUES, EVENT_STATUS_VALUES, EVENT_VISIBILITY_VALUES } from '../types/event.js'

export const createEventSchema = z.object({
  calendarId: z.string().min(1),
  title: z.string().trim().min(1).max(500),
  description: z.string().max(5000).nullable().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  allDay: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').toLowerCase().nullable().optional(),
  status: z.enum(EVENT_STATUS_VALUES).optional(),
  visibility: z.enum(EVENT_VISIBILITY_VALUES).optional(),
  eventType: z.enum(EVENT_TYPE_VALUES).optional(),
  recurrenceRule: z.string().nullable().optional(),
  reminderMinutes: z.number().int().min(0).max(10080).nullable().optional(),
}).refine(
  (d) => new Date(d.endTime) > new Date(d.startTime),
  { message: 'endTime must be after startTime', path: ['endTime'] },
)

export type CreateEvent = z.infer<typeof createEventSchema>

export const updateEventSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').toLowerCase().nullable().optional(),
  status: z.enum(EVENT_STATUS_VALUES).optional(),
  visibility: z.enum(EVENT_VISIBILITY_VALUES).optional(),
  eventType: z.enum(EVENT_TYPE_VALUES).optional(),
  recurrenceRule: z.string().nullable().optional(),
  reminderMinutes: z.number().int().min(0).max(10080).nullable().optional(),
})

export type UpdateEvent = z.infer<typeof updateEventSchema>
