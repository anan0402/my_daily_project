import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Send friend request. Server emit friend_request_received + new_notification cho người nhận.
 * @param {string} targetUserId
 * @returns {Promise} { message, requestId, targetUserId }
 */
export const sendFriendRequest = async (targetUserId) => {
  const response = await api.post(`/v1/friends/send-request/${targetUserId}`)
  return response.data
}

export const useSendFriendRequest = ({ mutationConfig } = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // POST không idempotent: retry sau khi server đã xử lý sẽ trả 409
    retry: false,
    onSuccess: (...args) => {
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: sendFriendRequest
  })
}
