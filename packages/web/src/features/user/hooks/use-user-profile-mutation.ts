import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../../../lib/api-client.js'

export function useUserProfileQuery() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
  })
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string }) => userApi.updateProfile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data),
  })
}
