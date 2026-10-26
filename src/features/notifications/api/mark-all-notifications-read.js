import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { updateNotificationsInCache } from '@/features/notifications/api/get-notifications'
import { setUnreadCountCache } from '@/features/notifications/api/get-unread-notification-count'

export const markAllNotificationsRead = async () => {
  const response = await api.put('/v1/notifications/read-all')
  return response.data
}

export const useMarkAllNotificationsRead = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      updateNotificationsInCache(queryClient, (notifications) =>
        notifications.map((item) => ({ ...item, isRead: true }))
      )
      setUnreadCountCache(queryClient, 0)
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: markAllNotificationsRead
  })
}
