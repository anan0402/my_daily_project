import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get pending friend requests sent to the current user (newest first)
 * @returns {Promise} [{ _id: requestId, senderId, receiverId, status, createdAt, sender }]
 */
export const getReceivedFriendRequests = async () => {
  const response = await api.get('/v1/friends/received-request-list')
  return response.data
}

export const getReceivedFriendRequestsQueryOptions = () => {
  return queryOptions({
    queryKey: ['receivedFriendRequests'],
    queryFn: getReceivedFriendRequests
  })
}

export const useReceivedFriendRequests = ({ queryConfig } = {}) => {
  return useQuery({
    ...getReceivedFriendRequestsQueryOptions(),
    select: (data) => data || [],
    ...queryConfig
  })
}
