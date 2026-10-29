import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { updatePlanInCache } from '@/features/plans/api/get-plan'

/** Chỉ owner: thu hồi link mời hiện tại */
export const revokeInviteLink = async (planId) => {
  const response = await api.delete(`/v1/plans/${planId}/invite-link`)
  return response.data
}

export const useRevokeInviteLink = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, planId, ...args) => {
      updatePlanInCache(queryClient, planId, (plan) => ({ ...plan, inviteLink: null }))
      onSuccess?.(data, planId, ...args)
    },
    ...restConfig,
    mutationFn: revokeInviteLink
  })
}
