import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

import { subscribeToFriendRequests } from '@/features/friends/api/friend-socket'
import { getFriendsQueryOptions } from '@/features/friends/api/get-friends'
import { getReceivedFriendRequestsQueryOptions } from '@/features/friends/api/get-received-friend-requests'
import { useFriendStatusSubscriptions } from '@/features/friends/hooks/use-friend-status-subscriptions'
import { useNotificationSubscriptions } from '@/features/notifications/hooks/use-notification-subscriptions'
import { usePlanSubscriptions } from '@/features/plans/hooks/use-plan-subscriptions'
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
  usePlanSubscriptions()

  // friends + users: người kia gửi / chấp nhận lời mời -> đổi relationshipStatus và list bạn bè.
  // Thao tác của chính mình thì mutation tự invalidate.
  useEffect(() => {
    if (!isSocketConnected) return

    return subscribeToFriendRequests({
      onFriendRequestReceived: ({ sender } = {}) => {
        queryClient.invalidateQueries({ queryKey: getReceivedFriendRequestsQueryOptions().queryKey })
        if (sender?._id) {
          queryClient.invalidateQueries({ queryKey: getUserQueryOptions(sender._id).queryKey })
        }
      },
      onFriendRequestAcceptedNotification: ({ friend } = {}) => {
        if (friend?._id) {
          queryClient.invalidateQueries({ queryKey: getUserQueryOptions(friend._id).queryKey })
        }
        queryClient.invalidateQueries({ queryKey: getFriendsQueryOptions().queryKey })
      }
    })
  }, [isSocketConnected, queryClient])
}
