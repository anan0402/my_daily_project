import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * Owner / editor: nút Clear ở mục Completed.
 * @returns {Promise} { deletedCount }
 */
export const clearCompletedPlanTasks = async (planId) => {
  const response = await api.delete(`/v1/plans/${planId}/tasks/completed`)
  return response.data
}

export const useClearCompletedPlanTasks = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: clearCompletedPlanTasks
  })
}
