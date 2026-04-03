import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../../../lib/api-client.js'

export function useCreateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      eventsApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
