import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Chỉ owner: đổi quyền Can edit / Can view.
 * @returns {Promise} PlanDetail
 */
export const updatePlanMember = async ({ planId, userId, role }) => {
  const response = await api.put(`/v1/plans/${planId}/members/${userId}`, { role })
  return response.data
}

export const useUpdatePlanMember = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: updatePlanMember
  })
}
