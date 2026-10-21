import authorizeAxiosInstance from '@/utils/authorizeAxiosInstance'

export const getNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const response = await authorizeAxiosInstance.get('/v1/notifications', {
    params: { page, limit }
  })
  return response.data
}

export const getUnreadNotificationCount = async () => {
  const response = await authorizeAxiosInstance.get('/v1/notifications/unread-count')
  return response.data
}

export const markNotificationRead = async (id) => {
  const response = await authorizeAxiosInstance.put(`/v1/notifications/${id}/read`)
  return response.data
}

export const markAllNotificationsRead = async () => {
  const response = await authorizeAxiosInstance.put('/v1/notifications/read-all')
  return response.data
}

export const deleteNotification = async (id) => {
  const response = await authorizeAxiosInstance.delete(`/v1/notifications/${id}`)
  return response.data
}
