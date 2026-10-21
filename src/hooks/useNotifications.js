import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '@/services/notification.service'

export const NOTIFICATIONS_QUERY_KEY = ['notifications']
export const UNREAD_COUNT_QUERY_KEY = ['notifications-unread-count']
export const NOTIFICATION_PAGE_SIZE = 20

/**
 * Danh sách notification, phân trang theo scroll (react-virtuoso gọi fetchNextPage)
 */
export const useInfiniteNotifications = (options = {}) => {
  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ page: pageParam, limit: NOTIFICATION_PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    ...options
  })
}

/**
 * Số notification chưa đọc - dùng cho badge trên header
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: getUnreadNotificationCount,
    select: (data) => data?.count || 0,
    staleTime: 1000 * 60
  })
}

/**
 * Đẩy notification mới (nhận từ socket) vào đầu page đầu tiên của list đã cache.
 * Dùng chung cho useGlobalSocketSubscriptions.
 */
export const prependNotificationToCache = (queryClient, notification) => {
  queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev) => {
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

export const setUnreadCountCache = (queryClient, count) => {
  queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, { count })
}

/**
 * Cập nhật 1 notification trong mọi page của cache
 */
const patchNotificationInCache = (queryClient, notificationId, patch) => {
  queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev) => {
    if (!prev?.pages?.length) return prev

    return {
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        notifications: (page?.notifications || []).map((item) =>
          item._id === notificationId ? { ...item, ...patch } : item
        )
      }))
    }
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: (notificationId) => {
      patchNotificationInCache(queryClient, notificationId, { isRead: true })
    },
    onSuccess: (data) => {
      if (typeof data?.unreadCount === 'number') {
        setUnreadCountCache(queryClient, data.unreadCount)
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    }
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev) => {
        if (!prev?.pages?.length) return prev
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            notifications: (page?.notifications || []).map((item) => ({
              ...item,
              isRead: true
            }))
          }))
        }
      })
      setUnreadCountCache(queryClient, 0)
    }
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: (notificationId) => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev) => {
        if (!prev?.pages?.length) return prev
        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            notifications: (page?.notifications || []).filter(
              (item) => item._id !== notificationId
            )
          }))
        }
      })
    },
    onSuccess: (data) => {
      if (typeof data?.unreadCount === 'number') {
        setUnreadCountCache(queryClient, data.unreadCount)
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    }
  })
}
