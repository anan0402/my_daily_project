import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Chỉ owner. Plan private sẽ tự chuyển thành shared. Người được mời nhận notification plan_invite.
 * @param {object} params
 * @param {string[]} params.userIds
 * @param {'editor'|'viewer'} params.role
 * @returns {Promise} PlanDetail
 */
export const addPlanMembers = async ({ planId, userIds, role }) => {
  const response = await api.post(`/v1/plans/${planId}/members`, { userIds, role })
  return response.data
}

export const useAddPlanMembers = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // Retry sau khi server đã thêm sẽ trả 400 "không có ai mới"
    retry: false,
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: addPlanMembers
  })
}
