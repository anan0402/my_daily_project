import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * @param {object} params
 * @param {'mine'|'shared'|'discover'|'saved'} params.scope
 * @param {string} [params.q] - Tìm theo title, chỉ áp dụng cho discover
 * @returns {Promise} { plans, stats: { total, openTasks } }. Plan trong list không có `tasks`, dùng `taskStats`.
 */
export const getPlans = async ({ scope, q }) => {
  const response = await api.get('/v1/plans', { params: { scope, q: q || undefined } })
  return response.data
}

/**
 * Không truyền scope thì queryKey là ['plans']: prefix của mọi query plans
 * (list, counts, detail), các mutation invalidate bằng key này.
 */
export const getPlansQueryOptions = ({ scope, q = '' } = {}) => {
  return queryOptions({
    queryKey: scope ? ['plans', 'list', scope, q] : ['plans'],
    queryFn: () => getPlans({ scope, q })
  })
}

export const usePlans = ({ scope, q, queryConfig } = {}) => {
  return useQuery({
    ...getPlansQueryOptions({ scope, q }),
    ...queryConfig
  })
}
