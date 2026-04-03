const BASE_URL = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...rest } = options ?? {}
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders as Record<string, string>),
    },
  })

  if (res.status === 204) return undefined as T

  const json = await res.json()
  if (!res.ok) {
    const err = json.error ?? { code: 'UNKNOWN', message: 'Request failed' }
    throw new ApiError(res.status, err.code, err.message)
  }
  return json
}

// Calendar types
export interface Calendar {
  id: string
  userId: string
  name: string
  description: string | null
  color: string
  timezone: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

// Event types
export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  allDay: boolean
  location: string | null
  color: string | null
  status: string
  visibility: string
  eventType: string
  recurrenceRule: string | null
  createdAt: string
  updatedAt: string
}

// Calendar member types
export interface CalendarMember {
  id: string
  calendarId: string
  userId: string
  userEmail: string
  userName: string | null
  permissionLevel: 'details' | 'edit' | 'admin'
  createdAt: string
}

// Shared calendar type
export interface SharedCalendar {
  id: string
  name: string
  description: string | null
  color: string
  timezone: string
  isPrimary: boolean
  permissionLevel: 'details' | 'edit' | 'admin'
  ownerEmail: string
  ownerName: string | null
  createdAt: string
  updatedAt: string
}

// Calendar API
export const calendarsApi = {
  list: () =>
    request<{ data: Calendar[] }>('/api/calendars').then((r) => r.data),

  bootstrap: () =>
    request<{ data: Calendar }>('/api/calendars/bootstrap', { method: 'POST' }).then((r) => r.data),
}

// Calendar members API
export const calendarMembersApi = {
  list: (calendarId: string) =>
    request<{ data: CalendarMember[] }>(`/api/calendars/${calendarId}/members`).then((r) => r.data),

  add: (calendarId: string, data: { email: string; permissionLevel: 'details' | 'edit' | 'admin' }) =>
    request<{ data: CalendarMember }>(`/api/calendars/${calendarId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  update: (calendarId: string, memberId: string, data: { permissionLevel: 'details' | 'edit' | 'admin' }) =>
    request<{ data: CalendarMember }>(`/api/calendars/${calendarId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  remove: (calendarId: string, memberId: string) =>
    request<void>(`/api/calendars/${calendarId}/members/${memberId}`, { method: 'DELETE' }),
}

// Shared calendars API
export const sharedCalendarsApi = {
  list: () =>
    request<{ data: SharedCalendar[] }>('/api/calendars/shared').then((r) => r.data),
}

// Events API
export const eventsApi = {
  list: (params: { calendarId?: string; startDate?: string; endDate?: string }) => {
    const qs = new URLSearchParams()
    if (params.calendarId) qs.set('calendarId', params.calendarId)
    if (params.startDate) qs.set('startDate', params.startDate)
    if (params.endDate) qs.set('endDate', params.endDate)
    const query = qs.toString()
    return request<{ data: CalendarEvent[] }>(`/api/events${query ? `?${query}` : ''}`).then((r) => r.data)
  },

  get: (id: string) =>
    request<{ data: CalendarEvent }>(`/api/events/${id}`).then((r) => r.data),

  create: (data: {
    calendarId: string
    title: string
    startTime: string
    endTime: string
    description?: string | null
    allDay?: boolean
    location?: string | null
    color?: string | null
    recurrenceRule?: string | null
  }) =>
    request<{ data: CalendarEvent }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ data: CalendarEvent }>(`/api/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  delete: (id: string) =>
    request<void>(`/api/events/${id}`, { method: 'DELETE' }),
}
