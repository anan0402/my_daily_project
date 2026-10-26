import { emitEvent, subscribeToEvent } from '@/lib/socket'
import { NOTIFICATION_EVENTS } from '@/utils/constants'

// ==================== Notification Services ====================
//
// Notification đọc/ghi qua REST (/v1/notifications - xem features/notifications/api).
// Socket chỉ dùng để nhận push realtime.

/**
 * Join the notifications room to receive real-time notifications
 * (BE đã tự join room theo userId lúc connect, emit thêm cho chắc khi reconnect)
 */
export const joinNotifications = () => {
  emitEvent(NOTIFICATION_EVENTS.JOIN_NOTIFICATIONS)
}

/**
 * Subscribe to realtime notification events
 * @param {object} handlers - { onNewNotification, onUnreadCount }
 * @returns {function} Unsubscribe function
 */
export const subscribeToNotifications = (handlers) => {
  const unsubscribers = []

  if (handlers.onNewNotification) {
    unsubscribers.push(
      subscribeToEvent(NOTIFICATION_EVENTS.NEW_NOTIFICATION, handlers.onNewNotification)
    )
  }

  if (handlers.onUnreadCount) {
    unsubscribers.push(
      subscribeToEvent(NOTIFICATION_EVENTS.UNREAD_COUNT, handlers.onUnreadCount)
    )
  }

  return () => {
    unsubscribers.forEach(unsub => unsub())
  }
}
