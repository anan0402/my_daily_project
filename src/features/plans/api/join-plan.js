import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Tham gia qua link mời. Đã là member/owner vẫn trả 200.
 * 404: link sai hoặc đã thu hồi. 422: token sai định dạng.
 * @returns {Promise} PlanDetail
 */
export const joinPlan = async (token) => {
  const response = await api.post(`/v1/plans/join/${token}`)
  return response.data
}

export const useJoinPlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: joinPlan
  })
}
