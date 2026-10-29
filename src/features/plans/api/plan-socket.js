import { subscribeToEvent } from '@/lib/socket'
import { PLAN_EVENTS } from '@/utils/constants'

// Thêm / sửa task, mời người... đi qua REST mutation. Socket chỉ để nghe việc người khác vừa làm.

/**
 * Subscribe các event làm plan thay đổi (task, member, thông tin plan, plan bị xoá).
 * @param {Function} handler - (eventName, payload) => void. payload luôn có { planId, actorId }
 * @returns {function} Unsubscribe function
 */
export const subscribeToPlanEvents = (handler) => {
  const unsubscribers = Object.values(PLAN_EVENTS).map((eventName) =>
    subscribeToEvent(eventName, (payload) => handler(eventName, payload || {}))
  )

  return () => {
    unsubscribers.forEach((unsub) => unsub())
  }
}
