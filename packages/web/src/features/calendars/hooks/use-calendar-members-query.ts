import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarMembersApi } from '../../../lib/api-client.js'

export function useCalendarMembersQuery(calendarId: string) {
  return useQuery({
    queryKey: ['calendar-members', calendarId],
    queryFn: () => calendarMembersApi.list(calendarId),
    enabled: !!calendarId,
  })
}

export function useAddMemberMutation(calendarId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; permissionLevel: 'details' | 'edit' | 'admin' }) =>
      calendarMembersApi.add(calendarId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['calendar-members', calendarId] })
    },
  })
}

export function useUpdateMemberMutation(calendarId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, permissionLevel }: { memberId: string; permissionLevel: 'details' | 'edit' | 'admin' }) =>
      calendarMembersApi.update(calendarId, memberId, { permissionLevel }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['calendar-members', calendarId] })
    },
  })
}

export function useRemoveMemberMutation(calendarId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => calendarMembersApi.remove(calendarId, memberId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['calendar-members', calendarId] })
    },
  })
}
