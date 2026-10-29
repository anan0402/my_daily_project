import { Link } from 'react-router'

import { PLAN_VIEWS } from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import './plans-workspace-layout.css'

/**
 * Khung Plan Workspace: sidebar điều hướng (desktop) + thanh chip (mobile).
 * @param {string|null} activeView - View đang mở; null ở trang chi tiết plan
 */
function PlansWorkspaceLayout({ activeView = null, children }) {
  return (
    <div className="plans-workspace">
      <aside className="plans-workspace-sidebar">
        <p className="plans-workspace-eyebrow">Workspace</p>
        <nav className="plans-workspace-nav" aria-label="Workspace">
          {PLAN_VIEWS.map((view) => (
            <Link
              key={view.value}
              to={paths.home.getHref(view.value)}
              className={`plans-workspace-nav-item ${activeView === view.value ? 'is-active' : ''}`}
              aria-current={activeView === view.value ? 'page' : undefined}
            >
              {view.label}
            </Link>
          ))}
        </nav>

        <div className="plans-workspace-sidebar-footer">
          <p>Plan together. Share what works.</p>
          <span className="plans-workspace-plan-tier">
            <span className="plans-workspace-plan-tier-dot" aria-hidden="true" />
            Free workspace
          </span>
        </div>
      </aside>

      <div className="plans-workspace-main">
        <nav className="plans-workspace-mobile-nav" aria-label="Workspace sections">
          {PLAN_VIEWS.map((view) => (
            <Link
              key={view.value}
              to={paths.home.getHref(view.value)}
              className={`plans-workspace-chip ${activeView === view.value ? 'is-active' : ''}`}
              aria-current={activeView === view.value ? 'page' : undefined}
            >
              {view.mobileLabel}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}

export default PlansWorkspaceLayout
