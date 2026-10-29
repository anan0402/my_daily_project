import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getPlanQueryOptions, setPlanCache, updatePlanInCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** Owner / editor. Xoá khỏi cache trước, rollback nếu lỗi */
export const deletePlanTask = async ({ planId, taskId }) => {
  const response = await api.delete(`/v1/plans/${planId}/tasks/${taskId}`)
  return response.data
}

export const useDeletePlanTask = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, onError, ...restConfig } = mutationConfig || {}

  return useMutation({
    onMutate: async ({ planId, taskId }) => {
      await queryClient.cancelQueries({ queryKey: getPlanQueryOptions(planId).queryKey })
      const previous = updatePlanInCache(queryClient, planId, (plan) => ({
        ...plan,
        tasks: plan.tasks.filter((task) => task._id !== taskId)
      }))
      return { previous }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    onError: (error, variables, context, ...args) => {
      if (context?.previous) setPlanCache(queryClient, context.previous)
      onError?.(error, variables, context, ...args)
    },
    ...restConfig,
    mutationFn: deletePlanTask
  })
}
