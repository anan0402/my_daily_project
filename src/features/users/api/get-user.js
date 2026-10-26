import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Get user details by ID (kèm relationshipStatus so với user hiện tại)
 * @param {string} userId - User ID
 * @returns {Promise} User details
 */
export const getUser = async (userId) => {
  const response = await api.get(`/v1/users/infor/${userId}`)
  return response.data
}

export const getUserQueryOptions = (userId) => {
  return queryOptions({
    queryKey: ['userDetails', userId],
    queryFn: () => getUser(userId),
    enabled: !!userId
  })
}

export const useUser = ({ userId, queryConfig } = {}) => {
  return useQuery({
    ...getUserQueryOptions(userId),
    ...queryConfig
  })
}
