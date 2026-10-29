import { getVisibilityLabel } from '@/features/plans/utils/plan-helpers'
import './plan-visibility-badge.css'

/**
 * @param {'private'|'shared'|'public'} visibility
 * @param {boolean} [inverse] - Trên nền tối (card nổi bật)
 */
function PlanVisibilityBadge({ visibility, inverse = false }) {
  return (
    <span className={`plan-visibility-badge plan-visibility-badge--${visibility} ${inverse ? 'is-inverse' : ''}`}>
      <span className="plan-visibility-badge-dot" aria-hidden="true" />
      {getVisibilityLabel(visibility)}
    </span>
  )
}

export default PlanVisibilityBadge
