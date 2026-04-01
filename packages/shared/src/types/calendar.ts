export const CALENDAR_PERMISSION_VALUES = ['free_busy', 'details', 'edit', 'admin'] as const

export const CalendarPermission = {
  free_busy: 'free_busy',
  details: 'details',
  edit: 'edit',
  admin: 'admin',
} as const

export type CalendarPermission = (typeof CALENDAR_PERMISSION_VALUES)[number]
