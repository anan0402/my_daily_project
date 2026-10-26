import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import {
  getInfiniteNotificationsQueryOptions,
  updateNotificationsInCache
} from '@/features/notifications/api/get-notifications'
import {
  getUnreadNotificationCountQueryOptions,
  setUnreadCountCache
} from '@/features/notifications/api/get-unread-notification-count'

export const deleteNotification = async (id) => {
  const response = await api.delete(`/v1/notifications/${id}`)
  return response.data
}

export const useDeleteNotification = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onMutate: (notificationId) => {
      updateNotificationsInCache(queryClient, (notifications) =>
        notifications.filter((item) => item._id !== notificationId)
      )
    },
    onSuccess: (data, ...args) => {
      if (typeof data?.unreadCount === 'number') {
        setUnreadCountCache(queryClient, data.unreadCount)
      }
      onSuccess?.(data, ...args)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: getInfiniteNotificationsQueryOptions().queryKey })
      queryClient.invalidateQueries({ queryKey: getUnreadNotificationCountQueryOptions().queryKey })
    },
    ...restConfig,
    mutationFn: deleteNotification
  })
}
