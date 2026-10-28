import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { getFriendsQueryOptions } from '@/features/friends/api/get-friends'
import { getReceivedFriendRequestsQueryOptions } from '@/features/friends/api/get-received-friend-requests'

/**
 * Accept friend request. Server emit friend_request_accepted_notification + new_notification cho người gửi.
 * @param {string} id - requestId, hoặc userId của người gửi (dùng ở trang profile)
 * @returns {Promise} { message, friendshipId, friend, friendRequest }
 */
export const acceptFriendRequest = async (id) => {
  const response = await api.post(`/v1/friends/accept-request/${id}`)
  return response.data
}

export const useAcceptFriendRequest = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // Retry sau khi server đã accept sẽ trả 404 (lời mời không còn pending)
    retry: false,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })
      queryClient.invalidateQueries({ queryKey: getReceivedFriendRequestsQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: acceptFriendRequest
  })
}
