import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Dialog from '@mui/material/Dialog'
import { toast } from 'react-toastify'

import { toUpdatePlanBody, updatePlanInputSchema, useUpdatePlan } from '@/features/plans/api/update-plan'
import { PLAN_COVER_COLORS, toDateInputValue } from '@/features/plans/utils/plan-helpers'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-dialog.css'
import './create-plan-dialog.css'

/**
 * Owner / editor sửa tên, mô tả, deadline, màu.
 */
function PlanEditDialog({ plan, open, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm({
    resolver: yupResolver(updatePlanInputSchema),
    values: {
      title: plan.title,
      description: plan.description || '',
      coverColor: plan.coverColor || 'ink',
      dueDate: toDateInputValue(plan.dueDate)
    },
    resetOptions: { keepDirtyValues: true }
  })

  const updatePlanMutation = useUpdatePlan({
    mutationConfig: {
      onSuccess: () => onClose(),
      onError: (error) => toast.error(getErrorMessage(error))
    }
  })

  const onSubmit = (values) => {
    updatePlanMutation.mutate({ planId: plan._id, ...toUpdatePlanBody(values) })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="plan-edit-title"
      slotProps={{
        paper: { className: 'plan-dialog-paper' },
        container: { className: 'plan-dialog-container' }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="plan-dialog-header">
          <h2 id="plan-edit-title" className="plan-dialog-title">Edit plan</h2>
          <button type="button" className="plan-dialog-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="plan-dialog-field">
          <label htmlFor="plan-edit-name" className="plan-dialog-label">Plan name</label>
          <input
            id="plan-edit-name"
            autoComplete="off"
            className="plan-dialog-input"
            aria-invalid={Boolean(errors.title)}
            {...register('title')}
          />
          {errors.title && <p className="plan-dialog-error">{errors.title.message}</p>}
        </div>

        <div className="plan-dialog-field">
          <label htmlFor="plan-edit-description" className="plan-dialog-label">Description</label>
          <textarea
            id="plan-edit-description"
            rows={3}
            className="plan-dialog-input"
            style={{ resize: 'vertical' }}
            {...register('description')}
          />
          {errors.description && <p className="plan-dialog-error">{errors.description.message}</p>}
        </div>

        <div className="create-plan-row">
          <fieldset className="plan-dialog-field">
            <legend className="plan-dialog-label">Color</legend>
            <div className="create-plan-colors">
              {PLAN_COVER_COLORS.map((color) => (
                <label key={color.value} className="create-plan-color" title={color.label}>
                  <input type="radio" value={color.value} aria-label={color.label} {...register('coverColor')} />
                  <span style={{ background: color.color }} />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="plan-dialog-field">
            <label htmlFor="plan-edit-due" className="plan-dialog-label">Deadline</label>
            <input id="plan-edit-due" type="date" className="plan-dialog-input" {...register('dueDate')} />
          </div>
        </div>

        <button type="submit" className="plan-dialog-submit" disabled={!isDirty || updatePlanMutation.isPending}>
          {updatePlanMutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </Dialog>
  )
}

export default PlanEditDialog
