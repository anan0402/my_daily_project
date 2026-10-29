import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** Chỉ owner: visibility, allowDuplicate */
export const updatePlan = ({ planId, ...patch }) => fakePlansDb.updatePlan(planId, patch)

export const useUpdatePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: updatePlan
  })
}
