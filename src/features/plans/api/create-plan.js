import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { setPlanCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'
import { PLAN_COVER_COLORS, PLAN_VISIBILITIES, toIsoDate } from '@/features/plans/utils/plan-helpers'

export const createPlanInputSchema = yup.object({
  title: yup.string().trim().required('Plan name is required').max(120, 'Max 120 characters'),
  // '' = Blank
  templateKey: yup.string().default(''),
  coverColor: yup.string().oneOf(PLAN_COVER_COLORS.map((item) => item.value)).required(),
  visibility: yup.string().oneOf(PLAN_VISIBILITIES.map((item) => item.value)).required(),
  dueDate: yup.string().default('')
})

/**
 * @param {object} input - giá trị form createPlanInputSchema (dueDate dạng yyyy-mm-dd)
 * @returns {Promise} PlanDetail
 */
export const createPlan = async ({ title, templateKey, coverColor, visibility, dueDate }) => {
  const response = await api.post('/v1/plans', {
    title: title.trim(),
    coverColor,
    visibility,
    dueDate: toIsoDate(dueDate),
    templateKey: templateKey || undefined
  })
  return response.data
}

export const useCreatePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    // POST không idempotent: retry có thể tạo 2 plan
    retry: false,
    onSuccess: (plan, ...args) => {
      setPlanCache(queryClient, plan)
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(plan, ...args)
    },
    ...restConfig,
    mutationFn: createPlan
  })
}
