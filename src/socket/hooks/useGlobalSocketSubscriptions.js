import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector, useDispatch } from 'react-redux'
import { selectSocketStatus } from '@/redux/socketSlice/socketSlice'
import { selectActiveChatUser, setActiveChatUser } from '@/redux/chatSlice/chatSlice'
import { subscribeToFriendStatus, subscribeToFriendRequests } from '../services/friendService'

/**
 * Global socket subscriptions that should always be active after login
 * This hook should be used at the App level to maintain persistent connections
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

    // Subscribe to friend request accepted event
    const unsubscribeFriendRequests = subscribeToFriendRequests({
      onFriendRequestAccepted: (data) => {
        // Update user details to change relationshipStatus to 'friend'
        if (data?.targetUserId) {
          queryClient.invalidateQueries({ queryKey: ['userDetails', data.targetUserId] })
        }
        // Refresh friends list
        queryClient.invalidateQueries({ queryKey: ['friends'] })
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
        queryClient.setQueryData(['friends'], (prevFriends = []) =>
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
        queryClient.setQueryData(['friends'], (prevFriends = []) =>
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
      unsubscribeFriendRequests()
      unsubscribeFriendStatus()
    }
  }, [isSocketConnected, activeChatUser])

  
}
