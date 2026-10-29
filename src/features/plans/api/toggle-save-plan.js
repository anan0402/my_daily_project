import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** Lưu / bỏ lưu plan vào mục Saved */
export const toggleSavePlan = (planId) => fakePlansDb.toggleSavePlan(planId)

export const useToggleSavePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: toggleSavePlan
  })
}
