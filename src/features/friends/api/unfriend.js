import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { getFriendsQueryOptions } from '@/features/friends/api/get-friends'

/**
 * Unfriend a user
 * @param {string} friendId
 */
export const unfriendUser = async (friendId) => {
  const response = await api.delete(`/v1/friends/unfriend/${friendId}`)
  return response.data
}

export const useUnfriend = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: unfriendUser
  })
}
