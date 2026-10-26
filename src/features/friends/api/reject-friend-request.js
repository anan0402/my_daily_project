import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { getFriendsQueryOptions } from '@/features/friends/api/get-friends'

/**
 * Reject friend request
 * @param {string} requestId
 */
export const rejectFriendRequest = async (requestId) => {
  const response = await api.delete(`/v1/friends/reject-request/${requestId}`)
  return response.data
}

export const useRejectFriendRequest = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: rejectFriendRequest
  })
}
