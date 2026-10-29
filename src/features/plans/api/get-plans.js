import { queryOptions, useQuery } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'

/**
 * Chưa có /v1/plans trên server: fetcher đọc fake DB (localStorage).
 * Khi có API thật: `api.get('/v1/plans', { params: { view } })`.
 * @param {object} params
 * @param {'mine'|'shared'|'discover'|'saved'} params.view
 */
export const getPlans = ({ view }) => fakePlansDb.listPlans({ view })

/**
 * Không truyền view thì queryKey là ['plans'], prefix của mọi query plans (list và detail):
 * các mutation invalidate bằng key này.
 */
export const getPlansQueryOptions = ({ view } = {}) => {
  return queryOptions({
    queryKey: view ? ['plans', 'list', view] : ['plans'],
    queryFn: () => getPlans({ view })
  })
}

export const usePlans = ({ view, queryConfig } = {}) => {
  return useQuery({
    ...getPlansQueryOptions({ view }),
    ...queryConfig
  })
}
