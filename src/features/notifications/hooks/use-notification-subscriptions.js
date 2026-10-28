import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

import { prependNotificationToCache } from '@/features/notifications/api/get-notifications'
import {
  getUnreadNotificationCountQueryOptions,
  setUnreadCountCache
} from '@/features/notifications/api/get-unread-notification-count'
import { joinNotifications, subscribeToNotifications } from '@/features/notifications/api/notification-socket'
import { selectSocketStatus } from '@/lib/store/socket-slice'

/**
 * List notification lấy qua REST, socket chỉ push item mới và unread count vào cache.
 */
export const useNotificationSubscriptions = () => {
  const queryClient = useQueryClient()
  const isSocketConnected = useSelector(selectSocketStatus)

  useEffect(() => {
    if (!isSocketConnected) return

    joinNotifications()

    return subscribeToNotifications({
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
  }, [isSocketConnected, queryClient])
}
