import { emitEvent, subscribeToEvent } from '../socket'
import { FRIEND_REQUEST_EVENTS, FRIEND_STATUS_EVENTS } from '@/utils/constants'

// ==================== Friend Request Services ====================

/**
 * Send a friend request
 * @param {string} receiverId - Receiver user ID
 */
export const sendFriendRequestSocket = (targetUserId) => {
  emitEvent(FRIEND_REQUEST_EVENTS.SEND_FRIEND_REQUEST, { targetUserId })
}

/**
 * Accept a friend request
 * @param {string} id - Can be friend request ID or sender's user ID
 */
export const acceptFriendRequestSocket = (id) => {
  emitEvent(FRIEND_REQUEST_EVENTS.ACCEPT_FRIEND_REQUEST, { id })
}

/**
 * Subscribe to friend request events
 * @param {object} handlers - Event handlers
 * @returns {function} Unsubscribe function
 */
export const subscribeToFriendRequests = (handlers) => {
  const unsubscribers = []

  if (handlers.onFriendRequestSent) {
    unsubscribers.push(
      subscribeToEvent(FRIEND_REQUEST_EVENTS.FRIEND_REQUEST_SENT, handlers.onFriendRequestSent)
    )
  }

  if (handlers.onFriendRequestReceived) {
    unsubscribers.push(
      subscribeToEvent(FRIEND_REQUEST_EVENTS.FRIEND_REQUEST_RECEIVED, handlers.onFriendRequestReceived)
    )
  }

  if (handlers.onFriendRequestAccepted) {
    unsubscribers.push(
      subscribeToEvent(FRIEND_REQUEST_EVENTS.FRIEND_REQUEST_ACCEPTED, handlers.onFriendRequestAccepted)
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
