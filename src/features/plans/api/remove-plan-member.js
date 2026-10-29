import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** Chỉ owner */
export const removePlanMember = ({ planId, memberId }) => fakePlansDb.removeMember(planId, memberId)

export const useRemovePlanMember = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: removePlanMember
  })
}
