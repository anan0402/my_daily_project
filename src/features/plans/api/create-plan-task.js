import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { updatePlanInCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Owner / editor. Task mới nằm cuối danh sách.
 * @returns {Promise} Task
 */
export const createPlanTask = async ({ planId, title, ...fields }) => {
  const response = await api.post(`/v1/plans/${planId}/tasks`, { title: title.trim(), ...fields })
  return response.data
}

export const useCreatePlanTask = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // POST không idempotent: retry có thể tạo task trùng
    retry: false,
    onSuccess: (task, variables, ...args) => {
      // Hiện task ngay, refetch sau để đồng bộ taskStats
      updatePlanInCache(queryClient, variables.planId, (plan) => ({ ...plan, tasks: [...plan.tasks, task] }))
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(task, variables, ...args)
    },
    ...restConfig,
    mutationFn: createPlanTask
  })
}
