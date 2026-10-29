import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

/** "Use this plan": tạo bản sao private thuộc về người dùng hiện tại */
export const duplicatePlan = ({ planId, ownerName }) => fakePlansDb.duplicatePlan(planId, { ownerName })

export const useDuplicatePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: duplicatePlan
  })
}
