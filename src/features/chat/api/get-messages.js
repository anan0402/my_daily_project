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

export const useInfiniteMessages = ({ conversationId, limit, search, queryConfig } = {}) => {
  return useInfiniteQuery({
    ...getInfiniteMessagesQueryOptions(conversationId, { limit, search }),
    ...queryConfig
  })
}
