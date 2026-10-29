import { useState } from 'react'
import { useNavigate } from 'react-router'

import { usePlans } from '@/features/plans/api/get-plans'
import CreatePlanDialog from '@/features/plans/components/create-plan-dialog'
import PlanCard from '@/features/plans/components/plan-card'
import { getPlanView } from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import './plan-list.css'

const EMPTY_STATES = {
  mine: {
    title: 'No plans yet.',
    description: 'Create your first plan. It starts private, invite people when you are ready.'
  },
  shared: {
    title: 'Nothing shared with you yet.',
    description: 'When someone invites you to a plan, it shows up here.'
  },
  discover: {
    title: 'Nothing to discover yet.',
    description: 'Public plans will appear here when they are published.'
  },
  saved: {
    title: 'No saved plans.',
    description: 'Save a public plan from Discover to keep it here.'
  }
}

/**
 * @param {'mine'|'shared'|'discover'|'saved'} view
 */
function PlanList({ view }) {
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data: plans = [], isLoading, isError, refetch } = usePlans({ view })

  const viewConfig = getPlanView(view)
  const emptyState = EMPTY_STATES[view] || EMPTY_STATES.mine
  const openTaskCount = plans.reduce(
    (sum, plan) => sum + plan.tasks.filter((task) => !task.completed).length,
    0
  )
  const description = view === 'mine'
    ? `${plans.length} ${plans.length === 1 ? 'plan' : 'plans'} · ${openTaskCount} open tasks`
    : viewConfig.description

  return (
    <div className="plan-list">
      <header className="plan-list-header">
        <div>
          <p className="plan-list-eyebrow">{viewConfig.eyebrow}</p>
          <h1 className="plan-list-title">{viewConfig.title}</h1>
          <p className="plan-list-description">{isLoading ? ' ' : description}</p>
        </div>
        {view === 'mine' && (
          <button type="button" className="plan-list-new-button" onClick={() => setIsCreateOpen(true)}>
            <span aria-hidden="true">+</span>
            New plan
          </button>
        )}
      </header>

      {isLoading && (
        <div className="plan-list-grid" aria-busy="true" aria-label="Loading plans">
          {[0, 1, 2].map((item) => <div key={item} className="plan-list-skeleton" />)}
        </div>
      )}

      {isError && (
        <div className="plan-list-empty">
          <p className="plan-list-empty-title">Could not load plans.</p>
          <button type="button" className="plan-list-link-button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && plans.length > 0 && (
        <div className="plan-list-grid">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              featured={view === 'mine' && index === 0}
              showOwner={view !== 'mine'}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && plans.length === 0 && (
        <div className="plan-list-empty">
          <p className="plan-list-empty-title">{emptyState.title}</p>
          <p className="plan-list-empty-description">{emptyState.description}</p>
          {view === 'mine' && (
            <button type="button" className="plan-list-link-button" onClick={() => setIsCreateOpen(true)}>
              + Create a plan
            </button>
          )}
          {view === 'saved' && (
            <button type="button" className="plan-list-link-button" onClick={() => navigate(paths.home.getHref('discover'))}>
              Browse Discover
            </button>
          )}
        </div>
      )}

      <CreatePlanDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(plan) => {
          setIsCreateOpen(false)
          navigate(paths.app.plan.getHref(plan._id))
        }}
      />
    </div>
  )
}

export default PlanList
