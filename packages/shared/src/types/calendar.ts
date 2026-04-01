export const CalendarPermission = {
  free_busy: 'free_busy',
  details: 'details',
  edit: 'edit',
  admin: 'admin',
} as const

export type CalendarPermission = (typeof CalendarPermission)[keyof typeof CalendarPermission]
