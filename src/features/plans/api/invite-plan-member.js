import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'

export const invitePlanMemberInputSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
  role: yup.string().oneOf(['editor', 'viewer']).required()
})

/** Chỉ owner. Mời vào plan private sẽ chuyển plan thành shared */
export const invitePlanMember = ({ planId, email, role }) => fakePlansDb.inviteMember(planId, { email, role })

export const useInvitePlanMember = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: invitePlanMember
  })
}
