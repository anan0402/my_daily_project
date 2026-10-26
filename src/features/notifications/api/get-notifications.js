import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

export const NOTIFICATION_PAGE_SIZE = 20

export const getNotifications = async ({ page = 1, limit = NOTIFICATION_PAGE_SIZE } = {}) => {
  const response = await api.get('/v1/notifications', {
    params: { page, limit }
  })
  return response.data
}

export const getInfiniteNotificationsQueryOptions = () => {
  return infiniteQueryOptions({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ page: pageParam, limit: NOTIFICATION_PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    refetchOnWindowFocus: false
  })
}

/**
 * Danh sách notification, phân trang theo scroll (react-virtuoso gọi fetchNextPage)
 */
export const useInfiniteNotifications = ({ queryConfig } = {}) => {
  return useInfiniteQuery({
    ...getInfiniteNotificationsQueryOptions(),
    ...queryConfig
  })
}

/**
 * Áp `updater` lên mảng notifications của từng page trong cache.
 * Chưa từng fetch list thì bỏ qua, để lần mở panel đầu tiên tự gọi API.
 */
export const updateNotificationsInCache = (queryClient, updater) => {
  queryClient.setQueryData(getInfiniteNotificationsQueryOptions().queryKey, (prev) => {
    if (!prev?.pages?.length) return prev

    return {
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        notifications: updater(page?.notifications || [])
      }))
    }
  })
}

/**
 * Đẩy notification mới (nhận từ socket) vào đầu page đầu tiên của list đã cache.
 * Dùng cho useGlobalSocketSubscriptions.
 */
export const prependNotificationToCache = (queryClient, notification) => {
  queryClient.setQueryData(getInfiniteNotificationsQueryOptions().queryKey, (prev) => {
    // Chưa từng fetch list -> để lần mở panel đầu tiên tự gọi API
    if (!prev?.pages?.length) return prev

    const [firstPage, ...restPages] = prev.pages

    // Tránh append trùng khi server emit 2 lần
    const isDuplicated = prev.pages.some((page) =>
      page?.notifications?.some((item) => item._id === notification._id)
    )
    if (isDuplicated) return prev

    return {
      ...prev,
      pages: [
        {
          ...firstPage,
          notifications: [notification, ...(firstPage?.notifications || [])],
          pagination: {
            ...firstPage?.pagination,
            totalItems: (firstPage?.pagination?.totalItems || 0) + 1
          }
        },
        ...restPages
      ]
    }
  })
}
