import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

export const searchUsers = async (searchTerm) => {
  const response = await api.get('/v1/users/search', {
    params: { searchTerm }
  })
  return response.data
}

export const getSearchUsersQueryOptions = (searchTerm) => {
  return queryOptions({
    queryKey: ['search', searchTerm],
    queryFn: () => searchUsers(searchTerm),
    // Only fetch when query is not empty
    enabled: !!searchTerm && searchTerm.trim().length > 0
  })
}

export const useSearchUsers = ({ searchTerm, queryConfig } = {}) => {
  return useQuery({
    ...getSearchUsersQueryOptions(searchTerm),
    ...queryConfig
  })
}
