import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'
import { PLAN_COVER_COLORS, toIsoDate } from '@/features/plans/utils/plan-helpers'

// Form "Edit plan" (owner, editor). visibility / allowDuplicate đổi ở Sharing panel.
export const updatePlanInputSchema = yup.object({
  title: yup.string().trim().required('Plan name is required').max(120, 'Max 120 characters'),
  description: yup.string().max(1000, 'Max 1000 characters').default(''),
  coverColor: yup.string().oneOf(PLAN_COVER_COLORS.map((item) => item.value)).required(),
  // yyyy-mm-dd từ <input type="date">
  dueDate: yup.string().default('')
})

/** Giá trị form updatePlanInputSchema → body của PUT /:id */
export const toUpdatePlanBody = ({ title, description, coverColor, dueDate }) => ({
  title: title.trim(),
  description,
  coverColor,
  dueDate: toIsoDate(dueDate)
})

/**
 * Owner, editor: title, description, dueDate, coverColor.
 * Chỉ owner: visibility, allowDuplicate. Về private khi còn member → 409.
 * @returns {Promise} PlanDetail
 */
export const updatePlan = async ({ planId, ...body }) => {
  const response = await api.put(`/v1/plans/${planId}`, body)
  return response.data
}

export const useUpdatePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: updatePlan
  })
}
