import { queryOptions, useQuery } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'

/**
 * @returns {Promise} plan kèm `myRole` ('owner' | 'editor' | 'viewer' | null)
 */
export const getPlan = (planId) => fakePlansDb.getPlan(planId)

export const getPlanQueryOptions = (planId) => {
  return queryOptions({
    queryKey: ['plans', 'detail', planId],
    queryFn: () => getPlan(planId),
    enabled: Boolean(planId)
  })
}

export const usePlan = ({ planId, queryConfig } = {}) => {
  return useQuery({
    ...getPlanQueryOptions(planId),
    ...queryConfig
  })
}

/** Optimistic update task của một plan; trả snapshot để rollback */
export const updatePlanTasksInCache = (queryClient, planId, updater) => {
  const queryKey = getPlanQueryOptions(planId).queryKey
  const previous = queryClient.getQueryData(queryKey)
  if (previous) {
    queryClient.setQueryData(queryKey, { ...previous, tasks: updater(previous.tasks) })
  }
  return previous
}

export const setPlanCache = (queryClient, plan) => {
  queryClient.setQueryData(getPlanQueryOptions(plan._id).queryKey, plan)
}
