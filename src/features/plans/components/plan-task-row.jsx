import './plan-task-row.css'

/**
 * @param {object} task - { _id, title, completed }
 * @param {boolean} canEdit - Viewer / người xem plan public chỉ xem
 */
function PlanTaskRow({ task, canEdit, onToggle, onRemove }) {
  return (
    <div className={`plan-task-row ${task.completed ? 'is-completed' : ''}`}>
      <label className="plan-task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={!canEdit}
          onChange={() => onToggle(task._id)}
          aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        />
        <span className="plan-task-checkmark" aria-hidden="true" />
      </label>
      <span className="plan-task-title">{task.title}</span>
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
