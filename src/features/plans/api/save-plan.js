import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { updatePlanInCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * POST (save) / DELETE (unsave) /:id/save. Gọi lặp lại không làm sai số đếm.
 * @param {object} params
 * @param {boolean} params.isSaved - Trạng thái muốn chuyển tới
 * @returns {Promise} { isSaved, saveCount }
 */
export const savePlan = async ({ planId, isSaved }) => {
  const response = isSaved
    ? await api.post(`/v1/plans/${planId}/save`)
    : await api.delete(`/v1/plans/${planId}/save`)
  return response.data
}

export const useSavePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, variables, ...args) => {
      updatePlanInCache(queryClient, variables.planId, (plan) => ({
        ...plan,
        isSaved: data.isSaved,
        saveCount: data.saveCount
      }))
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(data, variables, ...args)
    },
    ...restConfig,
    mutationFn: savePlan
  })
}
