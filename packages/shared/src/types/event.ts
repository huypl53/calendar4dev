export const EVENT_TYPE_VALUES = ['standard', 'task', 'reminder', 'out_of_office', 'focus_time', 'working_location'] as const
export const EVENT_STATUS_VALUES = ['busy', 'free'] as const
export const EVENT_VISIBILITY_VALUES = ['public', 'private'] as const
export const EXCEPTION_TYPE_VALUES = ['cancelled', 'modified'] as const

export const EventType = {
  standard: 'standard',
  task: 'task',
  reminder: 'reminder',
  out_of_office: 'out_of_office',
  focus_time: 'focus_time',
  working_location: 'working_location',
} as const

export type EventType = (typeof EVENT_TYPE_VALUES)[number]

export const EventStatus = {
  busy: 'busy',
  free: 'free',
} as const

export type EventStatus = (typeof EVENT_STATUS_VALUES)[number]

export const EventVisibility = {
  public: 'public',
  private: 'private',
} as const

export type EventVisibility = (typeof EVENT_VISIBILITY_VALUES)[number]

export const ExceptionType = {
  cancelled: 'cancelled',
  modified: 'modified',
} as const

export type ExceptionType = (typeof EXCEPTION_TYPE_VALUES)[number]
