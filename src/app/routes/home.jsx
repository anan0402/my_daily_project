import { Navigate, useSearchParams } from 'react-router'

import DefaultLayout from '@/app/layouts/default-layout/default-layout'
import PlanList from '@/features/plans/components/plan-list'
import PlansWorkspaceLayout from '@/features/plans/components/plans-workspace-layout'
import { getPlanView } from '@/features/plans/utils/plan-helpers'
import { getPendingInviteToken } from '@/features/plans/utils/pending-invite'
import { paths } from '@/config/paths'

function HomeRoute() {
  const [searchParams] = useSearchParams()
  // Mở link mời lúc chưa đăng nhập: đăng nhập xong quay lại join (route join xoá token)
  const pendingInviteToken = getPendingInviteToken()
  // ?view= sai giá trị thì về My plans
  const view = getPlanView(searchParams.get('view')).value

  if (pendingInviteToken) {
    return <Navigate to={paths.app.planJoin.getHref(pendingInviteToken)} replace />
  }

  return (
    <DefaultLayout showSidebar={true}>
      <PlansWorkspaceLayout activeView={view}>
        <PlanList view={view} />
      </PlansWorkspaceLayout>
    </DefaultLayout>
  )
}

export default HomeRoute
