import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get conversation info including participant details
 * @param {string} conversationId - Conversation ID
 * @returns {Promise} Conversation info with user details
 */
export const getConversationInfo = async (conversationId) => {
  const response = await api.get(`/v1/conversations/${conversationId}/info`)
  return response.data
}

export const getConversationInfoQueryOptions = (conversationId) => {
  return queryOptions({
    queryKey: ['conversationInfo', conversationId],
    queryFn: () => getConversationInfo(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5
  })
}

export const useConversationInfo = ({ conversationId, queryConfig } = {}) => {
  return useQuery({
    ...getConversationInfoQueryOptions(conversationId),
    ...queryConfig
  })
}
