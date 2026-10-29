import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Dialog from '@mui/material/Dialog'
import { toast } from 'react-toastify'

import { updatePlanTaskInputSchema, useUpdatePlanTask } from '@/features/plans/api/update-plan-task'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  getPersonName,
  toDateInputValue
} from '@/features/plans/utils/plan-helpers'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-dialog.css'
import './task-edit-dialog.css'

const getFormValues = (task) => ({
  title: task?.title || '',
  note: task?.note || '',
  status: task?.status || 'todo',
  priority: task?.priority || 'medium',
  assigneeIds: task?.assigneeIds || [],
  dueDate: toDateInputValue(task?.dueDate)
})

/**
 * Owner / editor sửa chi tiết task.
 * @param {object|null} task - null thì đóng
 * @param {Array} people - Owner + members, chỉ họ mới được giao task
 */
function TaskEditDialog({ planId, task, people, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm({
    resolver: yupResolver(updatePlanTaskInputSchema),
    // Form lấy giá trị từ task trong cache; socket cập nhật task thì giữ phần người dùng đang sửa
    values: getFormValues(task),
    resetOptions: { keepDirtyValues: true }
  })

  const updateTaskMutation = useUpdatePlanTask({
    mutationConfig: {
      onSuccess: () => onClose(),
      onError: (error) => toast.error(getErrorMessage(error))
    }
  })

  const onSubmit = (values) => {
    updateTaskMutation.mutate({ planId, taskId: task._id, ...values })
  }

  return (
    <Dialog
      open={Boolean(task)}
      onClose={onClose}
      aria-labelledby="task-edit-title"
      slotProps={{
        paper: { className: 'plan-dialog-paper' },
        container: { className: 'plan-dialog-container' }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="plan-dialog-header">
          <h2 id="task-edit-title" className="plan-dialog-title">Edit task</h2>
          <button type="button" className="plan-dialog-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="plan-dialog-field">
          <label htmlFor="task-title" className="plan-dialog-label">Title</label>
          <input
            id="task-title"
            autoComplete="off"
            className="plan-dialog-input"
            aria-invalid={Boolean(errors.title)}
            {...register('title')}
          />
          {errors.title && <p className="plan-dialog-error">{errors.title.message}</p>}
        </div>

        <div className="task-edit-row">
          <div className="plan-dialog-field">
            <label htmlFor="task-status" className="plan-dialog-label">Status</label>
            <select id="task-status" className="plan-dialog-input task-edit-select" {...register('status')}>
              {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="plan-dialog-field">
            <label htmlFor="task-due-date" className="plan-dialog-label">Deadline</label>
            <input id="task-due-date" type="date" className="plan-dialog-input" {...register('dueDate')} />
          </div>
        </div>

        <fieldset className="plan-dialog-field">
          <legend className="plan-dialog-label">Priority</legend>
          <div className="plan-dialog-options">
            {TASK_PRIORITIES.map((item) => (
              <label key={item.value} className="plan-dialog-option">
                <input type="radio" value={item.value} {...register('priority')} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="plan-dialog-field">
          <legend className="plan-dialog-label">Assignees</legend>
          <div className="task-edit-assignees">
            {people.map((person) => (
              <label key={person._id} className="task-edit-assignee">
                <input type="checkbox" value={person._id} {...register('assigneeIds')} />
                {getPersonName(person)}
              </label>
            ))}
          </div>
          {errors.assigneeIds && <p className="plan-dialog-error">{errors.assigneeIds.message}</p>}
        </fieldset>

        <div className="plan-dialog-field">
          <label htmlFor="task-note" className="plan-dialog-label">Note</label>
          <textarea
            id="task-note"
            rows={3}
            className="plan-dialog-input task-edit-note"
            placeholder="Details, links, reminders…"
            {...register('note')}
          />
          {errors.note && <p className="plan-dialog-error">{errors.note.message}</p>}
        </div>

        <button
          type="submit"
          className="plan-dialog-submit"
          disabled={!isDirty || updateTaskMutation.isPending}
        >
          {updateTaskMutation.isPending ? 'Saving…' : 'Save task'}
        </button>
      </form>
    </Dialog>
  )
}

export default TaskEditDialog
