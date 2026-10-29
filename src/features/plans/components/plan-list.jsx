import { useState } from 'react'
import { useNavigate } from 'react-router'

import { usePlans } from '@/features/plans/api/get-plans'
import CreatePlanDialog from '@/features/plans/components/create-plan-dialog'
import PlanCard from '@/features/plans/components/plan-card'
import { getPlanView } from '@/features/plans/utils/plan-helpers'
import { paths } from '@/config/paths'
import { useDebounce } from '@/hooks/use-debounce'
import { getErrorMessage } from '@/utils/get-error-message'
import './plan-list.css'

const EMPTY_STATES = {
  mine: {
    title: 'No plans yet.',
    description: 'Create your first plan. It starts private, invite people when you are ready.'
  },
  shared: {
    title: 'No one has invited you yet.',
    description: "Plans you're invited to will show up here."
  },
  discover: {
    title: 'Nothing here yet.',
    description: 'Public plans will appear here when they are published.'
  },
  saved: {
    title: 'No saved plans.',
    description: 'Save a public plan to find it here later.'
  }
}

/**
 * @param {'mine'|'shared'|'discover'|'saved'} view
 */
function PlanList({ view }) {
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search.trim(), 300)

  // Server chỉ tìm theo title ở discover
  const q = view === 'discover' ? debouncedSearch : ''
  const { data, isLoading, isError, error, refetch } = usePlans({ scope: view, q })
  const plans = data?.plans || []
  const stats = data?.stats

  const viewConfig = getPlanView(view)
  const emptyState = q
    ? { title: `No public plans match "${q}".`, description: 'Try another name.' }
    : EMPTY_STATES[view] || EMPTY_STATES.mine
  const description = view === 'mine' && stats
    ? `${stats.total} ${stats.total === 1 ? 'plan' : 'plans'} · ${stats.openTasks} open tasks`
    : viewConfig.description

  return (
    <div className="plan-list">
      <header className="plan-list-header">
        <div>
          <p className="plan-list-eyebrow">{viewConfig.eyebrow}</p>
          <h1 className="plan-list-title">{viewConfig.title}</h1>
          <p className="plan-list-description">{description || ' '}</p>
        </div>
        {view === 'mine' && (
          <button type="button" className="plan-list-new-button" onClick={() => setIsCreateOpen(true)}>
            <span aria-hidden="true">+</span>
            New plan
          </button>
        )}
      </header>

      {view === 'discover' && (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search public plans…"
          aria-label="Search public plans"
          className="plan-list-search"
        />
      )}

      {isLoading && (
        <div className="plan-list-grid" aria-busy="true" aria-label="Loading plans">
          {[0, 1, 2].map((item) => <div key={item} className="plan-list-skeleton" />)}
        </div>
      )}

      {isError && (
        <div className="plan-list-empty">
          <p className="plan-list-empty-title">Could not load plans.</p>
          <p className="plan-list-empty-description">{getErrorMessage(error)}</p>
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
              + New plan
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
          // Plan mới: focus ô "Add a task…"
          navigate(paths.app.plan.getHref(plan._id), { state: { focusAddTask: true } })
        }}
      />
    </div>
  )
}

export default PlanList
