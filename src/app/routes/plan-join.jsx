import { useEffect, useRef } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'

import SimpleCardLayout from '@/components/layouts/simple-card-layout'
import PageLoadingSpinner from '@/components/ui/page-loading-spinner'
import { useJoinPlan } from '@/features/plans/api/join-plan'
import { clearPendingInviteToken, savePendingInviteToken } from '@/features/plans/utils/pending-invite'
import { paths } from '@/config/paths'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getErrorMessage } from '@/utils/get-error-message'

/**
 * Link mời /plans/join/:token.
 * Chưa đăng nhập → giữ token, sang login; đăng nhập xong trang chủ đưa quay lại đây.
 * Đã đăng nhập → join rồi vào thẳng plan.
 */
function PlanJoinRoute() {
  const { token } = useParams()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const joinPlanMutation = useJoinPlan({
    mutationConfig: {
      onSuccess: (plan) => navigate(paths.app.plan.getHref(plan._id), { replace: true })
    }
  })
  const { mutate } = joinPlanMutation

  // StrictMode chạy effect 2 lần: chỉ gửi join một lần
  const hasJoinedRef = useRef(false)
  useEffect(() => {
    if (!currentUser || !token || hasJoinedRef.current) return
    hasJoinedRef.current = true
    clearPendingInviteToken()
    mutate(token)
  }, [currentUser, token, mutate])

  if (!currentUser) {
    savePendingInviteToken(token)
    return <Navigate to={paths.auth.login.getHref()} replace />
  }

  if (joinPlanMutation.isError) {
    const status = joinPlanMutation.error?.status
    return (
      <SimpleCardLayout
        title="Invitation not valid"
        description={status === 404 || status === 422
          ? 'This invitation link is wrong or has been revoked. Ask the owner for a new one.'
          : getErrorMessage(joinPlanMutation.error)}
      >
        <Link to={paths.home.getHref()} style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-fg)' }}>
          ← Go to my plans
        </Link>
      </SimpleCardLayout>
    )
  }

  return <PageLoadingSpinner message="Joining plan…" />
}

export default PlanJoinRoute
