import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { setPlanCache, updatePlanTasksInCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** Owner / editor. Cập nhật cache trước, rollback nếu lỗi */
export const togglePlanTask = ({ planId, taskId }) => fakePlansDb.toggleTask(planId, taskId)

export const useTogglePlanTask = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, onError, ...restConfig } = mutationConfig || {}

  return useMutation({
    onMutate: ({ planId, taskId }) => {
      const previous = updatePlanTasksInCache(queryClient, planId, (tasks) =>
        tasks.map((item) => item._id === taskId ? { ...item, completed: !item.completed } : item)
      )
      return { previous }
    },
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    onError: (error, variables, context, ...args) => {
      if (context?.previous) setPlanCache(queryClient, context.previous)
      onError?.(error, variables, context, ...args)
    },
    ...restConfig,
    mutationFn: togglePlanTask
  })
}
