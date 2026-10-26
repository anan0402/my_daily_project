import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get or create a private conversation with a user
 * @param {string} userId - User ID to start conversation with
 * @returns {Promise} Conversation object with conversationId, participants, etc.
 */
export const getOrCreateConversation = async (userId) => {
  const response = await api.post('/v1/conversations/private', {
    targetUserId: userId
  })
  return response.data
}

export const getConversationQueryOptions = (userId) => {
  return queryOptions({
    queryKey: ['conversation', userId],
    queryFn: () => getOrCreateConversation(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

export const useConversation = ({ userId, queryConfig } = {}) => {
  return useQuery({
    ...getConversationQueryOptions(userId),
    ...queryConfig
  })
}
