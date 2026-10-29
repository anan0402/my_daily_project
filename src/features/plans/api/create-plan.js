import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { fakePlansDb } from '@/testing/fake-plans-db'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'
import { PLAN_COLORS, PLAN_TEMPLATES, PLAN_VISIBILITIES } from '@/features/plans/utils/plan-helpers'

export const createPlanInputSchema = yup.object({
  title: yup.string().trim().required('Plan name is required').max(80, 'Max 80 characters'),
  template: yup.string().oneOf(PLAN_TEMPLATES.map((item) => item.value)).required(),
  color: yup.string().oneOf(PLAN_COLORS.map((item) => item.value)).required(),
  visibility: yup.string().oneOf(PLAN_VISIBILITIES.map((item) => item.value)).required(),
  dueDate: yup.string().nullable().transform((value) => value || null)
})

/**
 * @param {object} input - createPlanInputSchema + ownerName
 */
export const createPlan = ({ template, ...input }) => {
  const selectedTemplate = PLAN_TEMPLATES.find((item) => item.value === template)
  return fakePlansDb.createPlan({
    ...input,
    description: selectedTemplate?.description || '',
    tasks: selectedTemplate?.tasks || []
  })
}

export const useCreatePlan = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: createPlan
  })
}
