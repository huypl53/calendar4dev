import { useQuery } from '@tanstack/react-query'
import { sharedCalendarsApi } from '../../../lib/api-client.js'

export function useSharedCalendarsQuery() {
  return useQuery({
    queryKey: ['shared-calendars'],
    queryFn: sharedCalendarsApi.list,
  })
}
