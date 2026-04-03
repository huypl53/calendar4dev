import { useQuery } from '@tanstack/react-query'

// TODO: Replace with shared Event type when full schema is defined
interface Event {
  id: string
  title: string
  startTime: string
  endTime: string
  calendarId: string
}

export function useEventsQuery(calendarId?: string) {
  return useQuery({
    queryKey: ['events', { calendarId }],
    queryFn: async () => {
      // TODO: Replace with actual API call when event routes exist
      return [] as Event[]
    },
    enabled: !!calendarId,
  })
}
