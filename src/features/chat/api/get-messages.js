import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get message history for a conversation with pagination
 * @param {string} conversationId - Conversation ID
 * @param {Object} params - Query parameters { search, page, limit }
 * @returns {Promise} { messages: [], pagination }
 */
export const getMessages = async (conversationId, params = {}) => {
  const { search = '', page = 1, limit = 50 } = params

  const queryParams = new URLSearchParams({
    search,
    page: page.toString(),
    limit: limit.toString()
  })

  const response = await api.get(
    `/v1/conversations/${conversationId}/messages?${queryParams.toString()}`
  )
  return response.data
}

export const getInfiniteMessagesQueryOptions = (conversationId, { limit = 50, search = '' } = {}) => {
  return infiniteQueryOptions({
    queryKey: ['messages', conversationId, limit, search],
    // pageParam is the page number
    queryFn: ({ pageParam = 1 }) =>
      getMessages(conversationId, { page: pageParam, limit, search }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage?.pagination?.hasNextPage
      return hasNextPage ? lastPage?.pagination?.page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 // 1 minute
  })
}

/**
 * Thêm tin nhắn (từ socket hoặc optimistic) vào page mới nhất của list đã cache.
 * Dùng chung cache với lịch sử tin nhắn để chỉ có một nguồn dữ liệu.
 */
export const appendMessageToCache = (queryClient, conversationId, message) => {
  const { queryKey } = getInfiniteMessagesQueryOptions(conversationId)

  if (!queryClient.getQueryData(queryKey)?.pages?.length) {
    // List chưa về (đang fetch lần đầu) -> fetch lại để không mất tin vừa tới
    queryClient.invalidateQueries({ queryKey })
    return
  }

  queryClient.setQueryData(queryKey, (prev) => {
    const isDuplicated = prev.pages.some((page) =>
      page?.messages?.some((item) => item._id === message._id)
    )
    if (isDuplicated) return prev

    const [firstPage, ...restPages] = prev.pages
    return {
      ...prev,
      pages: [
        { ...firstPage, messages: [...(firstPage?.messages || []), message] },
        ...restPages
      ]
    }
  })
}

export const removeMessageFromCache = (queryClient, conversationId, messageId) => {
  queryClient.setQueryData(getInfiniteMessagesQueryOptions(conversationId).queryKey, (prev) => {
    if (!prev?.pages?.length) return prev

    return {
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        messages: (page?.messages || []).filter((item) => item._id !== messageId)
      }))
    }
  })
}

export const useInfiniteMessages =({ conversationId, limit, search, queryConfig } = {}) => {
  return useInfiniteQuery({
    ...getInfiniteMessagesQueryOptions(conversationId, { limit, search }),
    ...queryConfig
  })
}
