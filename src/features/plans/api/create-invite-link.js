import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { updatePlanInCache } from '@/features/plans/api/get-plan'

/**
 * Chỉ owner. Mỗi lần gọi sinh token mới, link cũ hết hiệu lực ngay.
 * @param {object} params
 * @param {'editor'|'viewer'} params.role
 * @returns {Promise} InviteLink { token, role, createdAt, url }
 */
export const createInviteLink = async ({ planId, role }) => {
  const response = await api.post(`/v1/plans/${planId}/invite-link`, { role })
  return response.data
}

export const useCreateInviteLink = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // Mỗi lần gọi là một token mới
    retry: false,
    onSuccess: (inviteLink, variables, ...args) => {
      updatePlanInCache(queryClient, variables.planId, (plan) => ({ ...plan, inviteLink }))
      onSuccess?.(inviteLink, variables, ...args)
    },
    ...restConfig,
    mutationFn: createInviteLink
  })
}
