import { Link } from 'react-router'

import AvatarStack from '@/features/plans/components/avatar-stack'
import PlanVisibilityBadge from '@/features/plans/components/plan-visibility-badge'
import {
  formatCount,
  formatDueDate,
  getCoverColor,
  getPersonName,
  getPlanPeople
} from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import './plan-card.css'

/**
 * @param {object} plan - Plan trong list (không có `tasks`, dùng `taskStats`)
 * @param {boolean} [featured] - Card đầu tiên của My plans, nền đảo màu
 * @param {boolean} [showOwner] - Hiện "by ..." cho plan của người khác
 */
function PlanCard({ plan, featured = false, showOwner = false }) {
  const { completed = 0, total = 0, progress = 0 } = plan.taskStats || {}

  return (
    <Link
      to={paths.app.plan.getHref(plan._id)}
      className={`plan-card ${featured ? 'is-featured' : ''}`}
      style={{ '--plan-color': getCoverColor(plan.coverColor) }}
    >
      <span className="plan-card-cover" aria-hidden="true" />

      <div className="plan-card-meta">
        <PlanVisibilityBadge visibility={plan.visibility} inverse={featured} />
        <span className="plan-card-due">{formatDueDate(plan.dueDate)}</span>
      </div>

      <h2 className="plan-card-title">{plan.title}</h2>
      {showOwner && plan.owner && <p className="plan-card-owner">by {getPersonName(plan.owner)}</p>}
      {plan.description && <p className="plan-card-description">{plan.description}</p>}

      <div className="plan-card-footer">
        <div className="plan-card-progress" aria-hidden="true">
          <div className="plan-card-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="plan-card-stats">
          <span>
            {completed}/{total} tasks · {progress}%
            {plan.visibility === 'public' && plan.saveCount > 0 && ` · ${formatCount(plan.saveCount)} saves`}
          </span>
          <AvatarStack people={getPlanPeople(plan)} inverse={featured} />
        </div>
      </div>
    </Link>
  )
}

export default PlanCard
