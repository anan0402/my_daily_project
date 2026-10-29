import AvatarStack from '@/features/plans/components/avatar-stack'
import { formatDueDate, isOverdue } from '@/features/plans/utils/plan-helpers'
import './plan-task-row.css'

/**
 * @param {object} task - Task từ API ({ _id, title, status, priority, assigneeIds, dueDate })
 * @param {Array} people - Owner + members, để map assigneeIds sang avatar
 * @param {boolean} canEdit - Viewer / người xem plan public chỉ xem
 * @param {Function} [onOpen] - (task) => void, mở panel sửa task
 */
function PlanTaskRow({ task, people, canEdit, onToggle, onRemove, onOpen }) {
  const isDone = task.status === 'done'
  const assignees = people.filter((person) => task.assigneeIds?.includes(person._id))
  const overdue = !isDone && isOverdue(task.dueDate)
  const hasMeta = task.priority === 'high' || task.dueDate || task.note

  return (
    <div className={`plan-task-row ${isDone ? 'is-completed' : ''}`}>
      <label className="plan-task-checkbox">
        <input
          type="checkbox"
          checked={isDone}
          disabled={!canEdit}
          onChange={() => onToggle(task._id)}
          aria-label={isDone ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        />
        <span className="plan-task-checkmark" aria-hidden="true" />
      </label>

      <div className="plan-task-body">
        {canEdit ? (
          <button type="button" className="plan-task-title" onClick={() => onOpen?.(task)}>
            {task.title}
          </button>
        ) : (
          <span className="plan-task-title">{task.title}</span>
        )}
        {hasMeta && (
          <div className="plan-task-meta">
            {task.priority === 'high' && <span className="plan-task-chip plan-task-chip--high">High</span>}
            {task.dueDate && (
              <span className={`plan-task-due ${overdue ? 'is-overdue' : ''}`}>
                {overdue ? 'Overdue · ' : ''}{formatDueDate(task.dueDate)}
              </span>
            )}
            {task.note && <span className="plan-task-note-flag">Note</span>}
          </div>
        )}
      </div>

      {assignees.length > 0 && <AvatarStack people={assignees} max={2} size="small" />}

      {canEdit && (
        <button
          type="button"
          className="plan-task-remove"
          onClick={() => onRemove(task._id)}
          aria-label={`Remove "${task.title}"`}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default PlanTaskRow
