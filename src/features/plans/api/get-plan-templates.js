import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * @returns {Promise} { templates: [{ key, title, description, coverColor, tasks, taskCount }] }
 */
export const getPlanTemplates = async () => {
  const response = await api.get('/v1/plans/templates')
  return response.data
}

// Danh sách cố định trên server. Key nằm ngoài ['plans'] để mutation không invalidate nó.
export const getPlanTemplatesQueryOptions = () => {
  return queryOptions({
    queryKey: ['plan-templates'],
    queryFn: getPlanTemplates,
    staleTime: Infinity
  })
}

export const usePlanTemplates = ({ queryConfig } = {}) => {
  return useQuery({
    ...getPlanTemplatesQueryOptions(),
    select: (data) => data?.templates || [],
    ...queryConfig
  })
}
