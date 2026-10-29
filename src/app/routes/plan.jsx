import { useParams } from 'react-router'

import DefaultLayout from '@/app/layouts/default-layout/default-layout'
import PlanDetail from '@/features/plans/components/plan-detail'
import PlansWorkspaceLayout from '@/features/plans/components/plans-workspace-layout'

function PlanRoute() {
  const { planId } = useParams()

  return (
    <DefaultLayout showSidebar={true}>
      <PlansWorkspaceLayout>
        {/* key: đổi plan (vd. sau "Use this plan") thì reset input task */}
        <PlanDetail key={planId} planId={planId} />
      </PlansWorkspaceLayout>
    </DefaultLayout>
  )
}

export default PlanRoute
