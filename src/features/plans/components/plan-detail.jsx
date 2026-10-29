import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { useClearCompletedPlanTasks } from '@/features/plans/api/clear-completed-plan-tasks'
import { useCreatePlanTask } from '@/features/plans/api/create-plan-task'
import { useDeletePlanTask } from '@/features/plans/api/delete-plan-task'
import { useDuplicatePlan } from '@/features/plans/api/duplicate-plan'
import { usePlan } from '@/features/plans/api/get-plan'
import { useTogglePlanTask } from '@/features/plans/api/toggle-plan-task'
import { useToggleSavePlan } from '@/features/plans/api/toggle-save-plan'
import { useUpdatePlan } from '@/features/plans/api/update-plan'
import AvatarStack from '@/features/plans/components/avatar-stack'
import InvitePlanDialog from '@/features/plans/components/invite-plan-dialog'
import PlanTaskRow from '@/features/plans/components/plan-task-row'
import PlanVisibilityBadge from '@/features/plans/components/plan-visibility-badge'
import {
  PLAN_VISIBILITIES,
  ROLE_LABELS,
  canEditPlan,
  formatCount,
  formatDueDate,
  getCurrentUserName,
  getPlanColor,
  getPlanProgress,
  isPlanOwner
} from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-detail.css'

const showError = (error) => toast.error(getErrorMessage(error))

// Quay lại đúng mục của sidebar mà plan thuộc về
const getBackView = (plan) => {
  if (plan.myRole === 'owner') return 'mine'
  if (plan.myRole) return 'shared'
  return plan.savedByMe ? 'saved' : 'discover'
}

function PlanDetail({ planId }) {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const [newTask, setNewTask] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const { data: plan, isLoading, isError, error } = usePlan({ planId })

  const errorConfig = { mutationConfig: { onError: showError } }
  const createTaskMutation = useCreatePlanTask(errorConfig)
  const toggleTaskMutation = useTogglePlanTask(errorConfig)
  const deleteTaskMutation = useDeletePlanTask(errorConfig)
  const clearCompletedMutation = useClearCompletedPlanTasks(errorConfig)
  const updatePlanMutation = useUpdatePlan(errorConfig)
  const toggleSaveMutation = useToggleSavePlan(errorConfig)
  const duplicateMutation = useDuplicatePlan({
    mutationConfig: {
      onSuccess: (newPlan) => {
        toast.success('A private copy was added to My plans')
        navigate(paths.app.plan.getHref(newPlan._id))
      },
      onError: showError
    }
  })

  if (isLoading) {
    return <div className="plan-detail plan-detail-status" aria-busy="true">Loading plan…</div>
  }

  if (isError || !plan) {
    return (
      <div className="plan-detail plan-detail-status">
        <p>{getErrorMessage(error, 'Plan not found')}</p>
        <p className="plan-detail-status-hint">It may have been deleted or made private.</p>
        <Link to={paths.home.getHref()} className="plan-detail-back">← All plans</Link>
      </div>
    )
  }

  const canEdit = canEditPlan(plan)
  const isOwner = isPlanOwner(plan)
  const isPublic = plan.visibility === 'public'
  const activeTasks = plan.tasks.filter((task) => !task.completed)
  const doneTasks = plan.tasks.filter((task) => task.completed)
  const { completed, total, percent } = getPlanProgress(plan)
  const visibilityInfo = PLAN_VISIBILITIES.find((item) => item.value === plan.visibility)

  const handleAddTask = () => {
    const title = newTask.trim()
    if (!title) return
    createTaskMutation.mutate({ planId, title })
    setNewTask('')
  }

  const handleToggleTask = (taskId) => toggleTaskMutation.mutate({ planId, taskId })
  const handleRemoveTask = (taskId) => deleteTaskMutation.mutate({ planId, taskId })

  const handleDuplicate = () => {
    duplicateMutation.mutate({ planId, ownerName: getCurrentUserName(currentUser) })
  }

  return (
    <div className="plan-detail" style={{ '--plan-color': getPlanColor(plan.color) }}>
      <Link to={paths.home.getHref(getBackView(plan))} className="plan-detail-back">
        <span aria-hidden="true">←</span> All plans
      </Link>

      <div className="plan-detail-layout">
        <div className="plan-detail-content">
          <header className="plan-detail-header">
            <span className="plan-detail-cover" aria-hidden="true" />
            <div className="plan-detail-meta">
              <PlanVisibilityBadge visibility={plan.visibility} />
              <span className="plan-detail-divider" aria-hidden="true" />
              <span>{plan.dueDate ? `Due ${formatDueDate(plan.dueDate)}` : 'No due date'}</span>
            </div>

            <div className="plan-detail-title-row">
              <h1 className="plan-detail-title">{plan.title}</h1>
              <div className="plan-detail-people">
                <AvatarStack members={plan.members} />
                {isOwner && (
                  <button type="button" className="plan-detail-invite" onClick={() => setIsInviteOpen(true)}>
                    Invite
                  </button>
                )}
              </div>
            </div>

            {!isOwner && <p className="plan-detail-owner">by {plan.ownerName}</p>}
            {plan.description && <p className="plan-detail-description">{plan.description}</p>}

            {isPublic && !isOwner && (
              <div className="plan-detail-public-actions">
                {plan.allowDuplicate && (
                  <button
                    type="button"
                    className="plan-detail-primary-button"
                    onClick={handleDuplicate}
                    disabled={duplicateMutation.isPending}
                  >
                    {duplicateMutation.isPending ? 'Copying…' : 'Use this plan'}
                  </button>
                )}
                <button
                  type="button"
                  className="plan-detail-secondary-button"
                  onClick={() => toggleSaveMutation.mutate(planId)}
                  disabled={toggleSaveMutation.isPending}
                  aria-pressed={plan.savedByMe}
                >
                  {plan.savedByMe ? 'Saved' : 'Save'}
                </button>
                <span className="plan-detail-public-stats">
                  {total} tasks · {percent}% completed
                  {plan.saveCount > 0 && ` · ${formatCount(plan.saveCount)} saves`}
                </span>
              </div>
            )}
          </header>

          {canEdit ? (
            <div className="plan-detail-add">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddTask()}
                placeholder="Add a task to this plan…"
                aria-label="New task"
                className="plan-detail-add-input"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="plan-detail-add-button"
                disabled={!newTask.trim()}
              >
                Add
              </button>
            </div>
          ) : (
            <p className="plan-detail-readonly">
              {plan.myRole === 'viewer'
                ? 'You can view this plan. Ask the owner for edit access to change tasks.'
                : 'You are viewing a public plan. Use it to get your own editable copy.'}
            </p>
          )}

          {activeTasks.length > 0 && (
            <div className="plan-detail-tasks">
              {activeTasks.map((task) => (
                <PlanTaskRow
                  key={task._id}
                  task={task}
                  canEdit={canEdit}
                  onToggle={handleToggleTask}
                  onRemove={handleRemoveTask}
                />
              ))}
            </div>
          )}

          {doneTasks.length > 0 && (
            <section aria-labelledby="plan-completed-title">
              <div className="plan-detail-section-header">
                <h2 id="plan-completed-title" className="plan-detail-section-title">Completed</h2>
                {canEdit && (
                  <button
                    type="button"
                    className="plan-detail-clear"
                    onClick={() => clearCompletedMutation.mutate(planId)}
                    disabled={clearCompletedMutation.isPending}
                  >
                    Clear
                  </button>
                )}
              </div>
              {doneTasks.map((task) => (
                <PlanTaskRow
                  key={task._id}
                  task={task}
                  canEdit={canEdit}
                  onToggle={handleToggleTask}
                  onRemove={handleRemoveTask}
                />
              ))}
            </section>
          )}

          {plan.tasks.length === 0 && (
            <p className="plan-detail-empty">
              {canEdit ? 'Start with the first small step.' : 'No tasks yet.'}
            </p>
          )}
        </div>

        <aside className="plan-detail-aside">
          <section className="plan-detail-aside-section">
            <div className="plan-detail-progress-header">
              <h2 className="plan-detail-aside-title">Progress</h2>
              <span className="plan-detail-progress-value">{percent}%</span>
            </div>
            <div className="plan-detail-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Plan progress">
              <div className="plan-detail-progress-bar" style={{ width: `${percent}%` }} />
            </div>
            <p className="plan-detail-aside-text">{completed} of {total} tasks completed</p>
          </section>

          <section className="plan-detail-aside-section">
            <h2 className="plan-detail-aside-title">People</h2>
            <p className="plan-detail-aside-text">
              {plan.members.length} {plan.members.length === 1 ? 'member' : 'members'}
              {plan.myRole && ` · you: ${ROLE_LABELS[plan.myRole].toLowerCase()}`}
            </p>
            {isOwner && (
              <button type="button" className="plan-detail-text-button" onClick={() => setIsInviteOpen(true)}>
                + Invite people
              </button>
            )}
          </section>

          <section className="plan-detail-aside-section">
            <h2 className="plan-detail-aside-title">Sharing</h2>
            {isOwner ? (
              <>
                <div className="plan-detail-visibility" role="radiogroup" aria-label="Who can see this plan">
                  {PLAN_VISIBILITIES.map((visibility) => (
                    <button
                      key={visibility.value}
                      type="button"
                      role="radio"
                      aria-checked={plan.visibility === visibility.value}
                      className={`plan-detail-visibility-option ${plan.visibility === visibility.value ? 'is-active' : ''}`}
                      onClick={() => updatePlanMutation.mutate({ planId, visibility: visibility.value })}
                      disabled={updatePlanMutation.isPending}
                    >
                      {visibility.label}
                    </button>
                  ))}
                </div>
                <p className="plan-detail-aside-text">{visibilityInfo?.description}</p>
                {isPublic && (
                  <label className="plan-detail-checkbox">
                    <input
                      type="checkbox"
                      checked={plan.allowDuplicate}
                      onChange={(event) => updatePlanMutation.mutate({ planId, allowDuplicate: event.target.checked })}
                      disabled={updatePlanMutation.isPending}
                    />
                    Allow others to use this plan as a template
                  </label>
                )}
              </>
            ) : (
              <p className="plan-detail-aside-text">{visibilityInfo?.description}</p>
            )}
          </section>
        </aside>
      </div>

      {isOwner && (
        <InvitePlanDialog plan={plan} open={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      )}
    </div>
  )
}

export default PlanDetail
