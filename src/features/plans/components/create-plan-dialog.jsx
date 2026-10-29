import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { yupResolver } from '@hookform/resolvers/yup'
import Dialog from '@mui/material/Dialog'
import { toast } from 'react-toastify'

import { createPlanInputSchema, useCreatePlan } from '@/features/plans/api/create-plan'
import {
  PLAN_COLORS,
  PLAN_TEMPLATES,
  PLAN_VISIBILITIES,
  getCurrentUserName
} from '@/features/plans/utils/plan-helpers'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-dialog.css'
import './create-plan-dialog.css'

// Mặc định Private để người dùng không vô tình công khai dữ liệu
const DEFAULT_VALUES = {
  title: '',
  template: 'blank',
  color: 'ink',
  visibility: 'private',
  dueDate: ''
}

/**
 * @param {Function} onCreated - (plan) => void
 */
function CreatePlanDialog({ open, onClose, onCreated }) {
  const currentUser = useSelector(selectCurrentUser)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createPlanInputSchema),
    defaultValues: DEFAULT_VALUES
  })

  const createPlanMutation = useCreatePlan({
    mutationConfig: {
      onSuccess: (plan) => {
        reset(DEFAULT_VALUES)
        onCreated?.(plan)
      },
      onError: (error) => toast.error(getErrorMessage(error))
    }
  })

  const selectedVisibility = watch('visibility')
  const selectedTemplate = PLAN_TEMPLATES.find((item) => item.value === watch('template'))

  const onSubmit = (values) => {
    createPlanMutation.mutate({ ...values, ownerName: getCurrentUserName(currentUser) })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="create-plan-title"
      slotProps={{
        paper: { className: 'plan-dialog-paper' },
        container: { className: 'plan-dialog-container' }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="plan-dialog-header">
          <div>
            <h2 id="create-plan-title" className="plan-dialog-title">Create a plan</h2>
            <p className="plan-dialog-subtitle">Start private. Invite people when you are ready.</p>
          </div>
          <button type="button" className="plan-dialog-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="plan-dialog-field">
          <label htmlFor="plan-title" className="plan-dialog-label">Plan name</label>
          <input
            id="plan-title"
            autoFocus
            autoComplete="off"
            placeholder="e.g. Trip to Da Lat"
            className="plan-dialog-input"
            aria-invalid={Boolean(errors.title)}
            {...register('title')}
          />
          {errors.title && <p className="plan-dialog-error">{errors.title.message}</p>}
        </div>

        <fieldset className="plan-dialog-field">
          <legend className="plan-dialog-label">Start from</legend>
          <div className="plan-dialog-options">
            {PLAN_TEMPLATES.map((template) => (
              <label key={template.value} className="plan-dialog-option">
                <input type="radio" value={template.value} {...register('template')} />
                <span>{template.label}</span>
              </label>
            ))}
          </div>
          <p className="plan-dialog-hint">
            {selectedTemplate?.tasks.length
              ? `${selectedTemplate.tasks.length} starter tasks: ${selectedTemplate.tasks.join(', ')}.`
              : 'An empty plan. Add tasks after creating it.'}
          </p>
        </fieldset>

        <div className="create-plan-row">
          <fieldset className="plan-dialog-field">
            <legend className="plan-dialog-label">Color</legend>
            <div className="create-plan-colors">
              {PLAN_COLORS.map((color) => (
                <label key={color.value} className="create-plan-color" title={color.label}>
                  <input type="radio" value={color.value} aria-label={color.label} {...register('color')} />
                  <span style={{ background: color.hex }} />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="plan-dialog-field">
            <label htmlFor="plan-due-date" className="plan-dialog-label">Due date (optional)</label>
            <input id="plan-due-date" type="date" className="plan-dialog-input" {...register('dueDate')} />
          </div>
        </div>

        <fieldset className="plan-dialog-field">
          <legend className="plan-dialog-label">Who can see it</legend>
          <div className="plan-dialog-options">
            {PLAN_VISIBILITIES.map((visibility) => (
              <label key={visibility.value} className="plan-dialog-option">
                <input type="radio" value={visibility.value} {...register('visibility')} />
                <span>{visibility.label}</span>
              </label>
            ))}
          </div>
          <p className="plan-dialog-hint">
            {PLAN_VISIBILITIES.find((item) => item.value === selectedVisibility)?.description}
          </p>
        </fieldset>

        <button type="submit" className="plan-dialog-submit" disabled={createPlanMutation.isPending}>
          {createPlanMutation.isPending ? 'Creating…' : 'Create plan'}
        </button>
      </form>
    </Dialog>
  )
}

export default CreatePlanDialog
