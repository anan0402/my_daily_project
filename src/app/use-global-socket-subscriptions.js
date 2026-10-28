import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

import { subscribeToFriendRequests } from '@/features/friends/api/friend-socket'
import { getFriendsQueryOptions } from '@/features/friends/api/get-friends'
import { useFriendStatusSubscriptions } from '@/features/friends/hooks/use-friend-status-subscriptions'
import { useNotificationSubscriptions } from '@/features/notifications/hooks/use-notification-subscriptions'
import { getUserQueryOptions } from '@/features/users/api/get-user'
import { selectSocketStatus } from '@/lib/store/socket-slice'

/**
 * Global socket subscriptions that should always be active after login
 * This hook should be used at the App level to maintain persistent connections.
 *
 * Event chỉ đụng cache của 1 feature thì nằm trong hook của feature đó.
 * File này chỉ gọi các hook đó và xử lý event đụng cache của nhiều feature.
 */
export const useGlobalSocketSubscriptions = () => {
  const queryClient = useQueryClient()
  const isSocketConnected = useSelector(selectSocketStatus)

  useNotificationSubscriptions()
  useFriendStatusSubscriptions()

  // friends + users: chấp nhận lời mời -> đổi relationshipStatus của user và list bạn bè
  useEffect(() => {
    if (!isSocketConnected) return

    return subscribeToFriendRequests({
      onFriendRequestAccepted: (data) => {
        if (data?.targetUserId) {
          queryClient.invalidateQueries({ queryKey: getUserQueryOptions(data.targetUserId).queryKey })
        }
        queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })
      }
    })
  }, [isSocketConnected, queryClient])
}
