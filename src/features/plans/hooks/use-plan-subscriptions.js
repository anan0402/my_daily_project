import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector, useStore } from 'react-redux'

import { getPlanQueryOptions } from '@/features/plans/api/get-plan'
import { subscribeToPlanEvents } from '@/features/plans/api/plan-socket'
import { getPlansQueryOptions } from '@/features/plans/api/get-plans'
import { selectSocketStatus } from '@/lib/store/socket-slice'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { PLAN_EVENTS } from '@/utils/constants'

/**
 * Người khác sửa plan / task / member → làm mới cache plans (list, counts, detail).
 * Bỏ qua event của chính mình: mutation ở tab này đã tự cập nhật cache.
 */
export const usePlanSubscriptions = () => {
  const queryClient = useQueryClient()
  const store = useStore()
  const isSocketConnected = useSelector(selectSocketStatus)

  useEffect(() => {
    if (!isSocketConnected) return

    // Event phát ra lúc socket đang rớt đã bị mất
    queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })

    return subscribeToPlanEvents((eventName, { planId, actorId, userId }) => {
      const currentUserId = selectCurrentUser(store.getState())?._id
      if (actorId && actorId === currentUserId) return

      const removedMe =
        (eventName === PLAN_EVENTS.PLAN_MEMBER_REMOVED && userId === currentUserId) ||
        eventName === PLAN_EVENTS.PLAN_DELETED
      if (!removedMe || !planId) {
        queryClient.invalidateQueries({ queryKey: getPlansQueryOptions().queryKey })
        return
      }

      // Không còn quyền xem: đừng refetch detail ra 404.
      // Detail không ai mở thì bỏ khỏi cache; trang đang mở tự rời đi và dọn (usePlanAccessLost).
      const detailKey = getPlanQueryOptions(planId).queryKey
      queryClient.removeQueries({ queryKey: detailKey, type: 'inactive' })
      queryClient.invalidateQueries({
        queryKey: getPlansQueryOptions().queryKey,
        predicate: (query) => query.queryKey[1] !== 'detail' || query.queryKey[2] !== planId
      })
    })
  }, [isSocketConnected, queryClient, store])
}
