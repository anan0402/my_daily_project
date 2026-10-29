import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/**
 * "Use this plan": bản sao private của mình, task reset về todo, không có assignee.
 * 403 khi là người ngoài và owner tắt allowDuplicate.
 * @returns {Promise} PlanDetail của bản mới
 */
export const duplicatePlan = async ({ planId, title, keepDueDate = false }) => {
  const response = await api.post(`/v1/plans/${planId}/duplicate`, { title, keepDueDate })
  return response.data
}

export const useDuplicatePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // POST không idempotent: retry có thể tạo 2 bản sao
    retry: false,
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: duplicatePlan
  })
}
