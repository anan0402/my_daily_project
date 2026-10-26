import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get list of friends
 * @returns {Promise} List of friends
 */
export const getFriends = async () => {
  const response = await api.get('/v1/friends')
  return response.data
}

export const getFriendsQueryOptions = () => {
  return queryOptions({
    queryKey: ['friends'],
    queryFn: getFriends,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

export const useFriends = ({ queryConfig } = {}) => {
  return useQuery({
    ...getFriendsQueryOptions(),
    select: (data) => data || [],
    ...queryConfig
  })
}
