import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

import { subscribeToFriendStatus } from '@/features/friends/api/friend-socket'
import { getFriendsQueryOptions, setFriendsOnlineStatus } from '@/features/friends/api/get-friends'
import { selectSocketStatus } from '@/lib/store/socket-slice'

// Event có thể là 1 object hoặc mảng object { userId }
const getUserIds = (data) => {
  if (Array.isArray(data)) return data.map((item) => item.userId).filter(Boolean)
  return data?.userId ? [data.userId] : []
}

/**
 * Cập nhật trạng thái online/offline của bạn bè trong cache friends.
 * Cache này là nguồn duy nhất của trạng thái online (sidebar và header chat đều đọc từ đây).
 */
export const useFriendStatusSubscriptions = () => {
  const queryClient = useQueryClient()
  const isSocketConnected = useSelector(selectSocketStatus)

  useEffect(() => {
    if (!isSocketConnected) return

    // Mỗi lần (re)connect: event online/offline phát ra lúc socket đang rớt đã bị mất,
    // nên lấy lại trạng thái thật từ server
    queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })

    const handleStatusChange = (eventName, isOnline) => (data) => {
      const userIds = getUserIds(data)
      if (userIds.length === 0) {
        console.warn(`No userId in ${eventName} event:`, data)
        return
      }

      setFriendsOnlineStatus(queryClient, userIds, isOnline)
    }

    return subscribeToFriendStatus({
      onFriendOnline: handleStatusChange('friend_online', true),
      onFriendOffline: handleStatusChange('friend_offline', false)
    })
  }, [isSocketConnected, queryClient])
}
