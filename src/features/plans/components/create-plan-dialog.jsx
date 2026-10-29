import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Dialog from '@mui/material/Dialog'
import { toast } from 'react-toastify'

import { createPlanInputSchema, useCreatePlan } from '@/features/plans/api/create-plan'
import { usePlanTemplates } from '@/features/plans/api/get-plan-templates'
import { PLAN_COVER_COLORS, PLAN_VISIBILITIES } from '@/features/plans/utils/plan-helpers'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-dialog.css'
import './create-plan-dialog.css'

// Mặc định Private để người dùng không vô tình công khai dữ liệu
const DEFAULT_VALUES = {
  title: '',
  templateKey: '',
  coverColor: 'ink',
  visibility: 'private',
  dueDate: ''
}

/**
 * Mời thành viên làm ở trang chi tiết sau khi tạo (PLANS_API.md 8.3: MVP).
 * @param {Function} onCreated - (plan) => void
 */
function CreatePlanDialog({ open, onClose, onCreated }) {
  const { data: templates = [] } = usePlanTemplates({ queryConfig: { enabled: open } })
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
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
  const selectedTemplate = templates.find((item) => item.key === watch('templateKey'))

  const templateField = register('templateKey')
  const handleTemplateChange = (event) => {
    templateField.onChange(event)
    // Chọn template thì lấy luôn màu của template, người dùng vẫn đổi lại được
    const template = templates.find((item) => item.key === event.target.value)
    if (template?.coverColor) setValue('coverColor', template.coverColor)
  }

  const onSubmit = (values) => createPlanMutation.mutate(values)

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
            <label className="plan-dialog-option">
              <input type="radio" value="" {...templateField} onChange={handleTemplateChange} />
              <span>Blank</span>
            </label>
            {templates.map((template) => (
              <label key={template.key} className="plan-dialog-option">
                <input type="radio" value={template.key} {...templateField} onChange={handleTemplateChange} />
                <span>{template.title}</span>
              </label>
            ))}
          </div>
          <p className="plan-dialog-hint">
            {selectedTemplate
              ? `${selectedTemplate.taskCount} starter tasks. ${selectedTemplate.description || ''}`
              : 'An empty plan. Add tasks after creating it.'}
          </p>
        </fieldset>

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
            <label htmlFor="plan-due-date" className="plan-dialog-label">Deadline (optional)</label>
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
