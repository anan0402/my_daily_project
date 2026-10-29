import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getPlanQueryOptions, setPlanCache, updatePlanInCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Checkbox: done → todo, todo / in_progress → done.
 * @returns {Promise} Task
 */
export const togglePlanTask = async ({ planId, taskId }) => {
  const response = await api.put(`/v1/plans/${planId}/tasks/${taskId}/toggle`)
  return response.data
}

export const useTogglePlanTask = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, onError, onSettled, ...restConfig } = mutationConfig || {}

  return useMutation({
    // Toggle không idempotent: retry sau khi server đã đổi sẽ đổi ngược lại
    retry: false,
    // Người dùng tick liên tục: đổi cache ngay, rollback nếu lỗi
    onMutate: async ({ planId, taskId }) => {
      await queryClient.cancelQueries({ queryKey: getPlanQueryOptions(planId).queryKey })
      const previous = updatePlanInCache(queryClient, planId, (plan) => ({
        ...plan,
        tasks: plan.tasks.map((task) =>
          task._id === taskId ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task
        )
      }))
      return { previous }
    },
    onSuccess: (...args) => {
      onSuccess?.(...args)
    },
    onError: (error, variables, context, ...args) => {
      if (context?.previous) setPlanCache(queryClient, context.previous)
      onError?.(error, variables, context, ...args)
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSettled?.(...args)
    },
    ...restConfig,
    mutationFn: togglePlanTask
  })
}
