import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * 404 khi plan không tồn tại hoặc không có quyền xem (server không phân biệt).
 * @returns {Promise} PlanDetail: plan kèm `tasks` và `myRole`
 */
export const getPlan = async (planId) => {
  const response = await api.get(`/v1/plans/${planId}`)
  return response.data
}

export const getPlanQueryOptions = (planId) => {
  return queryOptions({
    queryKey: ['plans', 'detail', planId],
    queryFn: () => getPlan(planId),
    enabled: Boolean(planId),
    // 404 / 403 không cần thử lại
    retry: (failureCount, error) => error?.status >= 500 && failureCount < 1
  })
}

export const usePlan = ({ planId, queryConfig } = {}) => {
  return useQuery({
    ...getPlanQueryOptions(planId),
    ...queryConfig
  })
}

export const setPlanCache = (queryClient, plan) => {
  queryClient.setQueryData(getPlanQueryOptions(plan._id).queryKey, plan)
}

/** Optimistic update một phần plan detail; trả snapshot để rollback */
export const updatePlanInCache = (queryClient, planId, updater) => {
  const queryKey = getPlanQueryOptions(planId).queryKey
  const previous = queryClient.getQueryData(queryKey)
  if (previous) queryClient.setQueryData(queryKey, updater(previous))
  return previous
}
