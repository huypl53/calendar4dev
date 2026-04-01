export const EventType = {
  standard: 'standard',
  all_day: 'all_day',
  task: 'task',
  reminder: 'reminder',
  out_of_office: 'out_of_office',
  focus_time: 'focus_time',
  working_location: 'working_location',
} as const

export type EventType = (typeof EventType)[keyof typeof EventType]

export const EventStatus = {
  busy: 'busy',
  free: 'free',
} as const

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

export const EventVisibility = {
  public: 'public',
  private: 'private',
} as const

export type EventVisibility = (typeof EventVisibility)[keyof typeof EventVisibility]

export const ExceptionType = {
  cancelled: 'cancelled',
  modified: 'modified',
} as const

export type ExceptionType = (typeof ExceptionType)[keyof typeof ExceptionType]
