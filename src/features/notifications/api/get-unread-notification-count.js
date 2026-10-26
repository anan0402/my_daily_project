import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

export const getUnreadNotificationCount = async () => {
  const response = await api.get('/v1/notifications/unread-count')
  return response.data
}

export const getUnreadNotificationCountQueryOptions = () => {
  return queryOptions({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadNotificationCount,
    staleTime: 1000 * 60
  })
}

/**
 * Số notification chưa đọc - dùng cho badge trên header
 */
export const useUnreadNotificationCount = ({ queryConfig } = {}) => {
  return useQuery({
    ...getUnreadNotificationCountQueryOptions(),
    select: (data) => data?.count || 0,
    ...queryConfig
  })
}

export const setUnreadCountCache = (queryClient, count) => {
  queryClient.setQueryData(getUnreadNotificationCountQueryOptions().queryKey, { count })
}
