import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarsApi, type Calendar } from '../../../lib/api-client.js'

export type { Calendar }

export function useCalendarsQuery() {
  return useQuery({
    queryKey: ['calendars'],
    queryFn: calendarsApi.list,
  })
}

export function useBootstrapCalendar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: calendarsApi.bootstrap,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['calendars'] })
    },
  })
}
