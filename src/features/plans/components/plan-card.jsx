import { Link } from 'react-router'

import AvatarStack from '@/features/plans/components/avatar-stack'
import PlanVisibilityBadge from '@/features/plans/components/plan-visibility-badge'
import {
  formatCount,
  formatDueDate,
  getPlanColor,
  getPlanProgress
} from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import './plan-card.css'

/**
 * @param {object} plan
 * @param {boolean} [featured] - Card đầu tiên của My plans, nền đảo màu
 * @param {boolean} [showOwner] - Hiện "by ..." cho plan của người khác
 */
function PlanCard({ plan, featured = false, showOwner = false }) {
  const { completed, total, percent } = getPlanProgress(plan)

  return (
    <Link
      to={paths.app.plan.getHref(plan._id)}
      className={`plan-card ${featured ? 'is-featured' : ''}`}
      style={{ '--plan-color': getPlanColor(plan.color) }}
    >
      <span className="plan-card-cover" aria-hidden="true" />

      <div className="plan-card-meta">
        <PlanVisibilityBadge visibility={plan.visibility} inverse={featured} />
        <span className="plan-card-due">{formatDueDate(plan.dueDate)}</span>
      </div>

      <h2 className="plan-card-title">{plan.title}</h2>
      {showOwner && <p className="plan-card-owner">by {plan.ownerName}</p>}
      {plan.description && <p className="plan-card-description">{plan.description}</p>}

      <div className="plan-card-footer">
        <div className="plan-card-progress" aria-hidden="true">
          <div className="plan-card-progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <div className="plan-card-stats">
          <span>
            {completed}/{total} tasks · {percent}%
            {plan.visibility === 'public' && plan.saveCount > 0 && ` · ${formatCount(plan.saveCount)} saves`}
          </span>
          <AvatarStack members={plan.members} inverse={featured} />
        </div>
      </div>
    </Link>
  )
}

export default PlanCard
