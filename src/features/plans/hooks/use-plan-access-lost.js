import { useEffect, useRef } from 'react'
import { useSelector, useStore } from 'react-redux'

import { subscribeToPlanEvents } from '@/features/plans/api/plan-socket'
import { selectSocketStatus } from '@/lib/store/socket-slice'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { PLAN_EVENTS } from '@/utils/constants'

/**
 * Plan đang mở bị xoá hoặc mình bị gỡ khỏi plan (do người khác) → gọi onLost(message).
 * usePlanSubscriptions không refetch detail này (sẽ ra 404); trang đang mở rời đi rồi bỏ cache.
 */
export const usePlanAccessLost = (planId, onLost) => {
  const store = useStore()
  const isSocketConnected = useSelector(selectSocketStatus)
  // Đọc callback mới nhất lúc có event, không subscribe lại mỗi lần render
  const onLostRef = useRef(onLost)

  useEffect(() => {
    onLostRef.current = onLost
  })

  useEffect(() => {
    if (!isSocketConnected || !planId) return

    return subscribeToPlanEvents((eventName, payload) => {
      if (payload.planId !== planId) return
      const currentUserId = selectCurrentUser(store.getState())?._id
      if (payload.actorId === currentUserId) return

      if (eventName === PLAN_EVENTS.PLAN_DELETED) {
        onLostRef.current?.('This plan was deleted')
      } else if (eventName === PLAN_EVENTS.PLAN_MEMBER_REMOVED && payload.userId === currentUserId) {
        onLostRef.current?.('You were removed from this plan')
      }
    })
  }, [isSocketConnected, planId, store])
}
