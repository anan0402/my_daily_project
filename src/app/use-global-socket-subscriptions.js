import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector, useDispatch } from 'react-redux'

import { subscribeToFriendStatus, subscribeToFriendRequests } from '@/features/friends/api/friend-socket'
import { getFriendsQueryOptions } from '@/features/friends/api/get-friends'
import { prependNotificationToCache } from '@/features/notifications/api/get-notifications'
import {
  getUnreadNotificationCountQueryOptions,
  setUnreadCountCache
} from '@/features/notifications/api/get-unread-notification-count'
import { joinNotifications, subscribeToNotifications } from '@/features/notifications/api/notification-socket'
import { getUserQueryOptions } from '@/features/users/api/get-user'
import { selectActiveChatUser, setActiveChatUser } from '@/lib/store/chat-slice'
import { selectSocketStatus } from '@/lib/store/socket-slice'

/**
 * Global socket subscriptions that should always be active after login
 * This hook should be used at the App level to maintain persistent connections.
 *
 * Nằm ở tầng app (không thuộc feature nào) vì nó ghép cache của nhiều feature:
 * notifications, friends, users và trạng thái chat đang mở.
 */
export const useGlobalSocketSubscriptions = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const isSocketConnected = useSelector(selectSocketStatus)
  const activeChatUser = useSelector(selectActiveChatUser)

  useEffect(() => {
    if (!isSocketConnected) {
      return
    }

    // Notification: list lấy qua REST, socket chỉ push item mới vào cache
    joinNotifications()

    const unsubscribeNotifications = subscribeToNotifications({
      onNewNotification: (notification) => {
        if (!notification?._id) return

        prependNotificationToCache(queryClient, notification)
        // Badge: server gửi kèm unread_count, nhưng invalidate cho chắc
        // nếu panel chưa từng được mở
        queryClient.invalidateQueries({ queryKey: getUnreadNotificationCountQueryOptions().queryKey })
      },
      onUnreadCount: ({ count }) => {
        if (typeof count === 'number') setUnreadCountCache(queryClient, count)
      }
    })

    // Subscribe to friend request accepted event
    const unsubscribeFriendRequests = subscribeToFriendRequests({
      onFriendRequestAccepted: (data) => {
        // Update user details to change relationshipStatus to 'friend'
        if (data?.targetUserId) {
          queryClient.invalidateQueries({ queryKey: getUserQueryOptions(data.targetUserId).queryKey })
        }
        // Refresh friends list
        queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })
      }
    })

    // Subscribe to friend status events
    const unsubscribeFriendStatus = subscribeToFriendStatus({
      onFriendOnline: (data) => {
        // Handle both single object and array of objects
        const userIds = Array.isArray(data)
          ? data.map(item => item.userId).filter(Boolean)
          : data?.userId ? [data.userId] : []

        if (userIds.length === 0) {
          console.warn('No userId in friend_online event:', data)
          return
        }

        // Update friends list in React Query cache
        queryClient.setQueryData(getFriendsQueryOptions().queryKey, (prevFriends = []) =>
          prevFriends.map((friend) => {
            const friendData = friend.friendId || friend
            // Check if this friend is in the list of online users
            if (userIds.includes(friendData._id)) {
              if (friend.friendId) {
                return {
                  ...friend,
                  friendId: { ...friendData, isOnline: true }
                }
              }
              return { ...friend, isOnline: true }
            }
            return friend
          })
        )

        // Update active chat user status in Redux if they went online
        if (activeChatUser && userIds.includes(activeChatUser._id)) {
          dispatch(setActiveChatUser({
            ...activeChatUser,
            online: true
          }))
        }
      },
      onFriendOffline: (data) => {
        // Handle both single object and array of objects
        const userIds = Array.isArray(data)
          ? data.map(item => item.userId).filter(Boolean)
          : data?.userId ? [data.userId] : []

        if (userIds.length === 0) {
          console.warn('No userId in friend_offline event:', data)
          return
        }

        // Update friends list in React Query cache
        queryClient.setQueryData(getFriendsQueryOptions().queryKey, (prevFriends = []) =>
          prevFriends.map((friend) => {
            const friendData = friend.friendId || friend
            // Check if this friend is in the list of offline users
            if (userIds.includes(friendData._id)) {
              if (friend.friendId) {
                return {
                  ...friend,
                  friendId: { ...friendData, isOnline: false }
                }
              }
              return { ...friend, isOnline: false }
            }
            return friend
          })
        )

        // Update active chat user status in Redux if they went offline
        if (activeChatUser && userIds.includes(activeChatUser._id)) {
          dispatch(setActiveChatUser({
            ...activeChatUser,
            online: false
          }))
        }
      }
    })

    return () => {
      unsubscribeNotifications()
      unsubscribeFriendRequests()
      unsubscribeFriendStatus()
    }
  }, [isSocketConnected, activeChatUser, dispatch, queryClient])

  
}
