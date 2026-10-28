import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get list of friends
 * @returns {Promise} List of friends
 */
export const getFriends = async () => {
  const response = await api.get('/v1/friends')
  return response.data
}

export const getFriendsQueryOptions = () => {
  return queryOptions({
    queryKey: ['friends'],
    queryFn: getFriends,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

/**
 * Cập nhật trạng thái online của các bạn bè (nhận từ socket) trong list đã cache.
 * Item có thể là friend trực tiếp hoặc dạng { friendId: friend }.
 */
export const setFriendsOnlineStatus = (queryClient, userIds, isOnline) => {
  queryClient.setQueryData(getFriendsQueryOptions().queryKey, (prevFriends) => {
    if (!prevFriends) return prevFriends

    return prevFriends.map((friend) => {
      const friendData = friend.friendId || friend
      if (!userIds.includes(friendData._id)) return friend

      if (friend.friendId) {
        return { ...friend, friendId: { ...friendData, isOnline } }
      }
      return { ...friend, isOnline }
    })
  })
}

export const useFriends = ({ queryConfig } = {}) => {
  return useQuery({
    ...getFriendsQueryOptions(),
    select: (data) => data || [],
    ...queryConfig
  })
}
