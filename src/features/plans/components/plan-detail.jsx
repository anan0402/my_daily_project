import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useClearCompletedPlanTasks } from '@/features/plans/api/clear-completed-plan-tasks'
import { useCreatePlanTask } from '@/features/plans/api/create-plan-task'
import { useDeletePlan } from '@/features/plans/api/delete-plan'
import { useDeletePlanTask } from '@/features/plans/api/delete-plan-task'
import { useDuplicatePlan } from '@/features/plans/api/duplicate-plan'
import { getPlanQueryOptions, usePlan } from '@/features/plans/api/get-plan'
import { useRemovePlanMember } from '@/features/plans/api/remove-plan-member'
import { useSavePlan } from '@/features/plans/api/save-plan'
import { useTogglePlanTask } from '@/features/plans/api/toggle-plan-task'
import { useUpdatePlan } from '@/features/plans/api/update-plan'
import AvatarStack from '@/features/plans/components/avatar-stack'
import InvitePlanDialog from '@/features/plans/components/invite-plan-dialog'
import PlanEditDialog from '@/features/plans/components/plan-edit-dialog'
import PlanTaskRow from '@/features/plans/components/plan-task-row'
import PlanVisibilityBadge from '@/features/plans/components/plan-visibility-badge'
import PublishPlanDialog from '@/features/plans/components/publish-plan-dialog'
import TaskEditDialog from '@/features/plans/components/task-edit-dialog'
import { usePlanAccessLost } from '@/features/plans/hooks/use-plan-access-lost'
import {
  PLAN_VISIBILITIES,
  ROLE_LABELS,
  canEditPlan,
  formatCount,
  formatDueDate,
  getCoverColor,
  getPersonName,
  getPlanPeople,
  isPlanOwner,
  isPlanParticipant
} from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-detail.css'

const showError = (error) => toast.error(getErrorMessage(error))

// Quay lại đúng mục của sidebar mà plan thuộc về
const getBackView = (plan) => {
  if (plan.myRole === 'owner') return 'mine'
  if (isPlanParticipant(plan)) return 'shared'
  return plan.isSaved ? 'saved' : 'discover'
}

function PlanDetail({ planId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const currentUser = useSelector(selectCurrentUser)
  const addTaskInputRef = useRef(null)
  const [newTask, setNewTask] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [openDialog, setOpenDialog] = useState(null) // 'invite' | 'edit' | 'publish' | 'delete' | 'leave'

  const { data: plan, isLoading, isError, error } = usePlan({ planId })

  const leavePage = (message) => {
    if (message) toast.info(message)
    navigate(paths.home.getHref(), { replace: true })
    queryClient.removeQueries({ queryKey: getPlanQueryOptions(planId).queryKey })
  }

  // Người khác xoá plan / gỡ mình khỏi plan trong lúc đang mở
  usePlanAccessLost(planId, leavePage)

  // Vừa tạo plan: focus ô thêm task
  const shouldFocusAddTask = Boolean(location.state?.focusAddTask)
  useEffect(() => {
    if (shouldFocusAddTask && plan) addTaskInputRef.current?.focus()
  }, [shouldFocusAddTask, plan])

  const errorConfig = { mutationConfig: { onError: showError } }
  const createTaskMutation = useCreatePlanTask(errorConfig)
  const toggleTaskMutation = useTogglePlanTask(errorConfig)
  const deleteTaskMutation = useDeletePlanTask(errorConfig)
  const clearCompletedMutation = useClearCompletedPlanTasks(errorConfig)
  const savePlanMutation = useSavePlan(errorConfig)
  const updatePlanMutation = useUpdatePlan({
    mutationConfig: {
      onSuccess: () => setOpenDialog(null),
      onError: showError
    }
  })
  const duplicateMutation = useDuplicatePlan({
    mutationConfig: {
      onSuccess: (newPlan) => {
        toast.success('A private copy was added to My plans')
        navigate(paths.app.plan.getHref(newPlan._id))
      },
      onError: showError
    }
  })
  const deletePlanMutation = useDeletePlan({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Plan deleted')
        navigate(paths.home.getHref(), { replace: true })
      },
      onError: showError
    }
  })
  const leavePlanMutation = useRemovePlanMember({
    mutationConfig: {
      onSuccess: () => leavePage('You left the plan'),
      onError: showError
    }
  })

  if (isLoading) {
    return <div className="plan-detail plan-detail-status" aria-busy="true">Loading plan…</div>
  }

  if (isError || !plan) {
    return (
      <div className="plan-detail plan-detail-status">
        <p>
          {error?.status === 404 || !error
            ? "Plan not found or you don't have access."
            : getErrorMessage(error)}
        </p>
        <p className="plan-detail-status-hint">It may have been deleted or made private.</p>
        <Link to={paths.home.getHref()} className="plan-detail-back">← All plans</Link>
      </div>
    )
  }

  const canEdit = canEditPlan(plan)
  const isOwner = isPlanOwner(plan)
  const isParticipant = isPlanParticipant(plan)
  const isVisitor = !isParticipant
  const people = getPlanPeople(plan)
  const todoTasks = plan.tasks.filter((task) => task.status === 'todo')
  const inProgressTasks = plan.tasks.filter((task) => task.status === 'in_progress')
  const doneTasks = plan.tasks.filter((task) => task.status === 'done')
  // Tính từ tasks để checkbox optimistic cập nhật tiến độ ngay
  const total = plan.tasks.length
  const completed = doneTasks.length
  const percent = total ? Math.round((completed / total) * 100) : 0
  const visibilityInfo = PLAN_VISIBILITIES.find((item) => item.value === plan.visibility)
  const canUseAsTemplate = !isVisitor || plan.allowDuplicate
  const editingTask = plan.tasks.find((task) => task._id === editingTaskId) || null

  const handleAddTask = () => {
    const title = newTask.trim()
    if (!title) return
    createTaskMutation.mutate({ planId, title })
    setNewTask('')
  }

  const handleToggleTask = (taskId) => toggleTaskMutation.mutate({ planId, taskId })
  const handleRemoveTask = (taskId) => deleteTaskMutation.mutate({ planId, taskId })
  const handleDuplicate = () => duplicateMutation.mutate({ planId })

  const handleVisibilityChange = (visibility) => {
    if (visibility === plan.visibility) return
    // Publish phải xác nhận: bấm nhầm có thể công khai dữ liệu
    if (visibility === 'public') {
      setOpenDialog('publish')
      return
    }
    updatePlanMutation.mutate({ planId, visibility })
  }

  const renderTasks = (tasks) =>
    tasks.map((task) => (
      <PlanTaskRow
        key={task._id}
        task={task}
        people={people}
        canEdit={canEdit}
        onToggle={handleToggleTask}
        onRemove={handleRemoveTask}
        onOpen={(item) => setEditingTaskId(item._id)}
      />
    ))

  return (
    <div className="plan-detail" style={{ '--plan-color': getCoverColor(plan.coverColor) }}>
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
              <span>{plan.dueDate ? `Due ${formatDueDate(plan.dueDate)}` : 'No deadline'}</span>
              {canEdit && (
                <>
                  <span className="plan-detail-divider" aria-hidden="true" />
                  <button type="button" className="plan-detail-meta-button" onClick={() => setOpenDialog('edit')}>
                    Edit
                  </button>
                </>
              )}
            </div>

            <div className="plan-detail-title-row">
              <h1 className="plan-detail-title">{plan.title}</h1>
              {isParticipant && (
                <div className="plan-detail-people">
                  <AvatarStack people={people} />
                  {isOwner ? (
                    <button type="button" className="plan-detail-invite" onClick={() => setOpenDialog('invite')}>
                      Invite
                    </button>
                  ) : (
                    <button type="button" className="plan-detail-invite" onClick={() => setOpenDialog('leave')}>
                      Leave
                    </button>
                  )}
                </div>
              )}
            </div>

            {!isOwner && plan.owner && <p className="plan-detail-owner">by {getPersonName(plan.owner)}</p>}
            {plan.description && <p className="plan-detail-description">{plan.description}</p>}

            {/* Public page: người ngoài xem plan public */}
            {isVisitor && (
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
                  onClick={() => savePlanMutation.mutate({ planId, isSaved: !plan.isSaved })}
                  disabled={savePlanMutation.isPending}
                  aria-pressed={plan.isSaved}
                >
                  {plan.isSaved ? 'Saved' : 'Save'}
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
                ref={addTaskInputRef}
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddTask()}
                placeholder="Add a task to this plan…"
                aria-label="New task"
                maxLength={500}
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
                : plan.allowDuplicate
                  ? 'You are viewing a public plan. Use it to get your own editable copy.'
                  : 'You are viewing a public plan.'}
            </p>
          )}

          {inProgressTasks.length > 0 && (
            <section className="plan-detail-task-group" aria-labelledby="plan-in-progress-title">
              <h2 id="plan-in-progress-title" className="plan-detail-section-title">In progress</h2>
              {renderTasks(inProgressTasks)}
            </section>
          )}

          {todoTasks.length > 0 && (
            <section className="plan-detail-task-group" aria-label="To do">
              {inProgressTasks.length > 0 && <h2 className="plan-detail-section-title">To do</h2>}
              {renderTasks(todoTasks)}
            </section>
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
              {renderTasks(doneTasks)}
            </section>
          )}

          {total === 0 && (
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
              {people.length} {people.length === 1 ? 'person' : 'people'}
              {isParticipant && ` · you: ${ROLE_LABELS[plan.myRole].toLowerCase()}`}
            </p>
            {isOwner && (
              <button type="button" className="plan-detail-text-button" onClick={() => setOpenDialog('invite')}>
                + Invite people
              </button>
            )}
          </section>

          <section className="plan-detail-aside-section">
            <h2 className="plan-detail-aside-title">Sharing</h2>
            {isOwner ? (
              <>
                <div className="plan-detail-visibility" role="radiogroup" aria-label="Who can see this plan">
                  {PLAN_VISIBILITIES.map((visibility) => {
                    // Về private khi còn member → server trả 409
                    const disabled = visibility.value === 'private' && plan.members.length > 0
                    return (
                      <button
                        key={visibility.value}
                        type="button"
                        role="radio"
                        aria-checked={plan.visibility === visibility.value}
                        className={`plan-detail-visibility-option ${plan.visibility === visibility.value ? 'is-active' : ''}`}
                        onClick={() => handleVisibilityChange(visibility.value)}
                        disabled={disabled || updatePlanMutation.isPending}
                      >
                        {visibility.label}
                      </button>
                    )
                  })}
                </div>
                <p className="plan-detail-aside-text">{visibilityInfo?.description}</p>
                {plan.members.length > 0 && plan.visibility !== 'private' && (
                  <p className="plan-detail-aside-text">To make it private, remove all members first.</p>
                )}
                {plan.visibility === 'public' && (
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

          {isParticipant && (
            <section className="plan-detail-aside-section">
              <h2 className="plan-detail-aside-title">More</h2>
              {canUseAsTemplate && (
                <button
                  type="button"
                  className="plan-detail-text-button"
                  onClick={handleDuplicate}
                  disabled={duplicateMutation.isPending}
                >
                  {duplicateMutation.isPending ? 'Copying…' : 'Duplicate plan'}
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  className="plan-detail-text-button is-danger"
                  onClick={() => setOpenDialog('delete')}
                >
                  Delete plan
                </button>
              )}
            </section>
          )}
        </aside>
      </div>

      {isOwner && (
        <InvitePlanDialog plan={plan} open={openDialog === 'invite'} onClose={() => setOpenDialog(null)} />
      )}
      {canEdit && (
        <PlanEditDialog plan={plan} open={openDialog === 'edit'} onClose={() => setOpenDialog(null)} />
      )}
      {canEdit && (
        <TaskEditDialog
          planId={planId}
          task={editingTask}
          people={people}
          onClose={() => setEditingTaskId(null)}
        />
      )}
      {/* Mount lại mỗi lần mở để checkbox về giá trị mặc định */}
      {openDialog === 'publish' && (
        <PublishPlanDialog
          open
          isPending={updatePlanMutation.isPending}
          onClose={() => setOpenDialog(null)}
          onConfirm={({ allowDuplicate }) => updatePlanMutation.mutate({ planId, visibility: 'public', allowDuplicate })}
        />
      )}
      <ConfirmDialog
        open={openDialog === 'delete'}
        title="Delete this plan?"
        message="All tasks will be deleted and members will lose access. This cannot be undone."
        confirmText="Delete plan"
        isLoading={deletePlanMutation.isPending}
        onCancel={() => setOpenDialog(null)}
        onConfirm={() => deletePlanMutation.mutate(planId)}
      />
      <ConfirmDialog
        open={openDialog === 'leave'}
        title="Leave this plan?"
        message="You will lose access unless the owner invites you again."
        confirmText="Leave plan"
        isLoading={leavePlanMutation.isPending}
        onCancel={() => setOpenDialog(null)}
        onConfirm={() => leavePlanMutation.mutate({ planId, userId: currentUser?._id })}
      />
    </div>
  )
}

export default PlanDetail
