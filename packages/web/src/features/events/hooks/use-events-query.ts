import { useQuery } from '@tanstack/react-query'
import { eventsApi, type CalendarEvent } from '../../../lib/api-client.js'

export type { CalendarEvent }

export function useEventsQuery(params: {
  calendarId?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsApi.list(params),
    enabled: !!(params.startDate && params.endDate),
  })
}
