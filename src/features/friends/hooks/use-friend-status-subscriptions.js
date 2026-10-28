import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector, useStore } from 'react-redux'

import { subscribeToFriendStatus } from '@/features/friends/api/friend-socket'
import { setFriendsOnlineStatus } from '@/features/friends/api/get-friends'
import { selectActiveChatUser, setActiveChatUser } from '@/lib/store/chat-slice'
import { selectSocketStatus } from '@/lib/store/socket-slice'

// Event có thể là 1 object hoặc mảng object { userId }
const getUserIds = (data) => {
  if (Array.isArray(data)) return data.map((item) => item.userId).filter(Boolean)
  return data?.userId ? [data.userId] : []
}

/**
 * Cập nhật trạng thái online/offline của bạn bè trong cache friends
 * và của người đang chat (Redux chat slice).
 */
export const useFriendStatusSubscriptions = () => {
  const queryClient = useQueryClient()
  const store = useStore()
  const isSocketConnected = useSelector(selectSocketStatus)

  useEffect(() => {
    if (!isSocketConnected) return

    const handleStatusChange = (eventName, isOnline) => (data) => {
      const userIds = getUserIds(data)
      if (userIds.length === 0) {
        console.warn(`No userId in ${eventName} event:`, data)
        return
      }

      setFriendsOnlineStatus(queryClient, userIds, isOnline)

      // Đọc activeChatUser lúc event tới (không đưa vào deps) để việc đổi chat
      // không làm gỡ rồi đăng ký lại subscription
      const activeChatUser = selectActiveChatUser(store.getState())
      if (activeChatUser && userIds.includes(activeChatUser._id)) {
        store.dispatch(setActiveChatUser({ ...activeChatUser, online: isOnline }))
      }
    }

    return subscribeToFriendStatus({
      onFriendOnline: handleStatusChange('friend_online', true),
      onFriendOffline: handleStatusChange('friend_offline', false)
    })
  }, [isSocketConnected, queryClient, store])
}
