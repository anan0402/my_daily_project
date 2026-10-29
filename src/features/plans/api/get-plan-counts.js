import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Số đếm cho sidebar. Discover không có count.
 * @returns {Promise} { mine, shared, saved }
 */
export const getPlanCounts = async () => {
  const response = await api.get('/v1/plans/counts')
  return response.data
}

export const getPlanCountsQueryOptions = () => {
  return queryOptions({
    queryKey: ['plans', 'counts'],
    queryFn: getPlanCounts
  })
}

export const usePlanCounts = ({ queryConfig } = {}) => {
  return useQuery({
    ...getPlanCountsQueryOptions(),
    ...queryConfig
  })
}
