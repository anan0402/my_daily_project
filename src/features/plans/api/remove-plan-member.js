import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getPlanQueryOptions, setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Owner gỡ người khác → PlanDetail.
 * Member tự rời (userId = id của mình) → { left: true }, caller quay về danh sách.
 */
export const removePlanMember = async ({ planId, userId }) => {
  const response = await api.delete(`/v1/plans/${planId}/members/${userId}`)
  return response.data
}

export const useRemovePlanMember = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, variables, ...args) => {
      if (data?.left) {
        // Đã rời: không còn quyền xem, đừng refetch detail (404)
        queryClient.removeQueries({ queryKey: getPlanQueryOptions(variables.planId).queryKey })
      } else {
        setPlanCache(queryClient, data)
      }
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(data, variables, ...args)
    },
    ...restConfig,
    mutationFn: removePlanMember
  })
}
