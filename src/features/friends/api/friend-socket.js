import { subscribeToEvent } from '@/lib/socket'
import { FRIEND_REQUEST_EVENTS, FRIEND_STATUS_EVENTS } from '@/utils/constants'

// ==================== Friend Request Services ====================
// Gửi / chấp nhận lời mời đi qua REST (send-friend-request.js, accept-friend-request.js).
// Socket chỉ dùng để nghe việc người kia vừa làm.

/**
 * Subscribe to friend request events
 * @param {object} handlers - Event handlers
 *   onFriendRequestReceived({ message, requestId, sender })            - người nhận lời mời
 *   onFriendRequestAcceptedNotification({ message, friendshipId, friend }) - người đã gửi lời mời
 * @returns {function} Unsubscribe function
 */
export const subscribeToFriendRequests = (handlers) => {
  const unsubscribers = []

  if (handlers.onFriendRequestReceived) {
    unsubscribers.push(
      subscribeToEvent(FRIEND_REQUEST_EVENTS.FRIEND_REQUEST_RECEIVED, handlers.onFriendRequestReceived)
    )
  }

  if (handlers.onFriendRequestAcceptedNotification) {
    unsubscribers.push(
      subscribeToEvent(
        FRIEND_REQUEST_EVENTS.FRIEND_REQUEST_ACCEPTED_NOTIFICATION,
        handlers.onFriendRequestAcceptedNotification
      )
    )
  }

  // Return combined unsubscribe function
  return () => {
    unsubscribers.forEach(unsub => unsub())
  }
}

// ==================== Friend Status Services ====================

/**
 * Subscribe to friend status events (online/offline)
 * @param {object} handlers - Event handlers
 * @returns {function} Unsubscribe function
 */
export const subscribeToFriendStatus = (handlers) => {
  const unsubscribers = []

  if (handlers.onFriendOnline) {
    unsubscribers.push(
      subscribeToEvent(FRIEND_STATUS_EVENTS.FRIEND_ONLINE, handlers.onFriendOnline)
    )
  }

  if (handlers.onFriendOffline) {
    unsubscribers.push(
      subscribeToEvent(FRIEND_STATUS_EVENTS.FRIEND_OFFLINE, handlers.onFriendOffline)
    )
  }

  // Return combined unsubscribe function
  return () => {
    unsubscribers.forEach(unsub => unsub())
  }
}
