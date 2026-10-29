import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { updatePlanInCache } from '@/features/plans/api/get-plan'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'
import { TASK_PRIORITIES, TASK_STATUSES, toIsoDate } from '@/features/plans/utils/plan-helpers'

export const updatePlanTaskInputSchema = yup.object({
  title: yup.string().trim().required('Title is required').max(500, 'Max 500 characters'),
  note: yup.string().max(2000, 'Max 2000 characters').default(''),
  status: yup.string().oneOf(TASK_STATUSES.map((item) => item.value)).required(),
  priority: yup.string().oneOf(TASK_PRIORITIES.map((item) => item.value)).required(),
  // Nhóm checkbox chỉ có 1 ô thì React Hook Form trả string / false thay vì mảng
  assigneeIds: yup
    .array()
    .transform((_value, original) => (Array.isArray(original) ? original : original ? [original] : []))
    .of(yup.string())
    .max(20, 'Max 20 assignees')
    .default([]),
  // yyyy-mm-dd từ <input type="date">
  dueDate: yup.string().default('')
})

/**
 * Owner / editor. Đổi status sang/khỏi done thì server tự set completedAt / completedBy.
 * @returns {Promise} Task
 */
export const updatePlanTask = async ({ planId, taskId, dueDate, title, ...fields }) => {
  const response = await api.put(`/v1/plans/${planId}/tasks/${taskId}`, {
    ...fields,
    ...(title !== undefined && { title: title.trim() }),
    ...(dueDate !== undefined && { dueDate: toIsoDate(dueDate) })
  })
  return response.data
}

export const useUpdatePlanTask = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (task, variables, ...args) => {
      updatePlanInCache(queryClient, variables.planId, (plan) => ({
        ...plan,
        tasks: plan.tasks.map((item) => (item._id === task._id ? task : item))
      }))
      queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
      onSuccess?.(task, variables, ...args)
    },
    ...restConfig,
    mutationFn: updatePlanTask
  })
}
