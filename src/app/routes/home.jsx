import { useSearchParams } from 'react-router'

import DefaultLayout from '@/app/layouts/default-layout/default-layout'
import PlanList from '@/features/plans/components/plan-list'
import PlansWorkspaceLayout from '@/features/plans/components/plans-workspace-layout'
import { getPlanView } from '@/features/plans/utils/plan-helpers'

function HomeRoute() {
  const [searchParams] = useSearchParams()
  // ?view= sai giá trị thì về My plans
  const view = getPlanView(searchParams.get('view')).value

  return (
    <DefaultLayout showSidebar={true}>
      <PlansWorkspaceLayout activeView={view}>
        <PlanList view={view} />
      </PlansWorkspaceLayout>
    </DefaultLayout>
  )
}

export default HomeRoute
