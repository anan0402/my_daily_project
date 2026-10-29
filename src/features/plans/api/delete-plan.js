import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getPlanQueryOptions } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** Chỉ owner. Member đang mở plan nhận socket plan_deleted */
export const deletePlan = async (planId) => {
  const response = await api.delete(`/v1/plans/${planId}`)
  return response.data
}

export const useDeletePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, planId, ...args) => {
      // Bỏ detail khỏi cache trước khi invalidate, để không refetch plan vừa xoá (404)
      queryClient.removeQueries({ queryKey: getPlanQueryOptions(planId).queryKey })
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(data, planId, ...args)
    },
    ...restConfig,
    mutationFn: deletePlan
  })
}
